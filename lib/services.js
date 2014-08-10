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

  var checkStatus = function (service) {
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
  };

  serviceList.forEach(function (service) {
    setImmediate(function () {
      checkStatus(service);
    });
  });
};

exports.play = function (request, reply) {
  var play = function (services) {
    rvTether.play(request.params.token, function (err, result) {
      if (err) {
        reply(err).code(400);
        return;
      }

      reply.view('script', {
        title: 'revisit.link.hub',
        token: request.params.token,
        services: services,
        result: result
      });
    });
  };

  rvTether.getAll(request.params.token, function (err, services) {
    if (err) {
      reply(err).code(400);
      return;
    }

    play(services);
  });
};

exports.add = function (request, reply) {
  var count = 0;
  var urls = [request.payload.services];
  var content = request.payload.content;

  var addService = function (sv) {
    var service = {
      url: sv,
      token: request.payload.token,
      content: content
    };

    rvTether.add(service, function (err, svc) {
      content = svc.content;

      if (count === urls.length - 1) {
        reply.view('script', {
          title: 'revisit.link.hub',
          token: request.payload.token,
          content: content,
          services: [svc],
          result: false
        });
      }

      count ++;
    });
  };

  urls.forEach(function (sv) {
    setImmediate(function () {
      addService(sv);
    });
  });
};