'use strict';

var request = require('request');
var RevisitToken = require('revisit-token');
var RevisitTether = require('revisit-tether');

var rvToken = new RevisitToken({
  db: './db/tokens',
  ttl: 10000
});

var rvTether = new RevisitTether({
  db: './db/tethers'
});

var serviceList = require('../config/services.json');

var checkServiceStatus = function (url, next) {
  request({
    method: 'HEAD',
    url: url,
    followAllRedirects: false
  }, function (err, response) {
    if (err || response.statusCode !== 200) {
      next(new Error('Service unavailable'));
      return;
    }

    next(null, url);
  });
};

exports.getServices = function (request, reply) {
  rt.getAll('12345abc', function (err, services) {
    console.log(services);
  });
};

exports.getAll = function (request, reply) {
  var count = 0;
  var serviceStatuses = [];

  serviceList.forEach(function (service) {
    setImmediate(function () {
      checkServiceStatus(service.url, function (err) {
        var serviceItem = {
          url: service.url,
          description: service.description,
          online: false
        };

        if (!err) {
          serviceItem.online = true;
        }

        serviceStatuses.push(serviceItem);

        if (count === serviceList.length - 1) {
          rvToken.generate(function (err, token) {
            if (err) {
              throw err;
              return;
            }

            reply.view('index', {
              title: 'revisit.link.hub',
              subtitle: 'available services',
              services: serviceStatuses,
              token: token
            });
          });
        }

        count ++;
      });
    });
  });
};

exports.play = function (request, reply) {
  rvTether.getAll(request.params.token, function (err, services) {
    rvTether.play(request.params.token, function (err, result) {
      reply.view('script', {
        title: 'revisit.link.hub',
        token: request.params.token,
        services: services,
        result: result
      });
    });
  });
};

exports.add = function (request, reply) {
  var count = 0;
  var urls = [request.payload.services];

  urls.forEach(function (sv) {
    setImmediate(function () {
      var service = {
        url: sv,
        token: request.payload.token,
        content: request.payload.content
      };

      rvTether.add(service, function (err, svc) {
        if (count === urls.length - 1) {
          reply.view('script', {
            title: 'revisit.link.hub',
            token: request.payload.token,
            services: [svc],
            result: false
          });
        }

        count ++;
      });
    });
  });
};