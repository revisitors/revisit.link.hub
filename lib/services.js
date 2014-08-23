'use strict';

var fs = require('fs');
var request = require('request');
var RevisitToken = require('revisit-token');
var RevisitTether = require('revisit-tether');
var nconf = require('nconf');

nconf.argv().env().file({ file: 'local.json' });

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

exports.home = function (request, reply) {
  reply.view('index', {
    analytics: nconf.get('analytics')
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
        repository: service.repository,
        online: false
      };

      if (!err) {
        serviceItem.online = true;
      }

      serviceStatuses.push(serviceItem);

      if (serviceList.length < 2 || count === serviceList.length - 1) {
        rvToken.generate(function (err, token) {
          if (err) {
            throw err;
            return;
          }

          reply({
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
        reply.view('error', {
          reason: 'Looks like this token expired!'
        });
        return;
      }

      reply.view('script', {
        token: request.params.token,
        services: services.map(function (sv) {
          return sv.url
        }),
        result: result.content.data,
        analytics: nconf.get('analytics')
      });
    });
  };

  rvTether.getAll(request.params.token, function (err, services) {
    if (err) {
      reply.view('error', {
        reason: 'No services seem to be associated with this token'
      });
      return;
    }

    play(services);
  });
};

exports.add = function (request, reply) {
  var count = 0;
  if (!request.payload.services || !request.payload.content) {
    reply.redirect('/?error=invalid');
    return;
  }

  var urls = request.payload.services.split(',');
  var content = request.payload.content;

  var addService = function (sv) {
    var service = {
      url: sv,
      token: request.payload.token,
      content: {
        data: content
      },
      meta: { }
    };

    rvTether.add(service, function (err, svc) {
      if (urls.length < 2 || count === urls.length - 1) {
        reply.redirect('/' + request.payload.token + '/play');
        /*
        reply.view('script', {
          token: request.payload.token,
          content: svc.content.data,
          services: urls,
          result: false,
          analytics: nconf.get('analytics')
        });
*/
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
