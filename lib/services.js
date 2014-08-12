'use strict';

var fs = require('fs');
var request = require('request');
var RevisitToken = require('revisit-token');
var RevisitTether = require('revisit-tether');
var Magic = require('mmmagic').Magic;

var magic = new Magic();

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
        services: services.map(function (sv) {
          return sv.url
        }),
        result: result.content
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
  if (!request.payload.services || !request.payload.content) {
    reply.redirect('/');
    return;
  }

  var urls = request.payload.services.split(',');
  var content = request.payload.content;

  var addService = function (sv) {
    magic.detect(content, function (err, mimeType) {
      var service = {
        url: sv,
        token: request.payload.token,
        content: content,
        mimeType: mimeType.split(' ')[0]
      };

      rvTether.add(service, function (err, svc) {
        content = svc.content;

        if (count === urls.length - 1) {
          reply.view('script', {
            title: 'revisit.link.hub',
            token: request.payload.token,
            content: content,
            services: urls,
            result: false
          });
        }

        count ++;
      });
    });
  };

  urls.forEach(function (sv) {
    setImmediate(function () {
      addService(sv);
    });
  });
};
