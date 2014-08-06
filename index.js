'use strict';

var Hapi = require('hapi');
var Joi = require('joi');
var nconf = require('nconf');
var RevisitToken = require('revisit-token');
var rvToken = new RevisitToken({
  db: './db/tokens',
  ttl: 10000
});

nconf.argv().env().file({ file: 'local.json' });

var options = {
  views: {
    engines: {
      jade: require('jade')
    },
    path: __dirname + '/views',
    compileOptions: {
      pretty: true
    }
  }
};

var server = Hapi.createServer(nconf.get('domain'), nconf.get('authPort'), options);

var routes = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: getServices
    }
  },
  {
    method: 'POST',
    path: '/service/:id',
    config: {
      handler: sendToService
      /*
      validate: {
        query: {
          name: Joi.string()
        }
      }
      */
    }
  }
];

server.route(routes);

server.route({
  path: '/{path*}',
  method: "GET",
  handler: {
    directory: {
      path: './public',
      listing: false,
      index: false
    }
  }
});

server.start();

function getServices(request, reply) {
  rvToken.generate(function (err, token) {
    if (err) {
      throw err;
      return;
    }

    reply.view('index', {
      title: 'revisit.link.hub',
      subtitle: 'Available Services',
      services: [],
      token: token
    });
  });
}

function sendToService(request, reply) {
  console.log('sending service');
}