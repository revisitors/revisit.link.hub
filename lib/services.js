'use strict';

var request = require('request');
var RevisitToken = require('revisit-token');
var rvToken = new RevisitToken({
  db: './db/tokens',
  ttl: 10000
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

  serviceList.forEach(function (service) {
    checkServiceStatus(service.url, function (err) {
      if (err) {
        serviceStatuses.push({
          url: service.url,
          description: service.description,
          online: false
        });
      } else {
        serviceStatuses.push({
          url: service.url,
          description: service.description,
          online: true
        });
      }
      
      if (count === serviceList.length - 1) {
        rvToken.generate(function (err, token) {
          if (err) {
            throw err;
            return;
          }
          console.log(serviceStatuses)
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
};

exports.send = function (request, reply) {
  console.log('sending service');
};