'use strict';

var Hapi = require('hapi');
var Joi = require('joi');
var nconf = require('nconf');

var services = require('./lib/services');

nconf.argv().env().file({ file: 'local.json' });

var options = {
  views: {
    engines: {
      jade: require('jade')
    },
    isCached: process.env.node === 'production',
    path: __dirname + '/views',
    compileOptions: {
      pretty: true
    }
  }
};

var server = Hapi.createServer(nconf.get('domain'), nconf.get('port'), options);

var routes = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: services.getAll
    }
  },
  {
    method: 'POST',
    path: '/service',
    config: {
      payload: {
        maxBytes: 2000000
      },
      handler: services.add
    }
  },
  {
    method: 'GET',
    path: '/{token}/play',
    config: {
      handler: services.play
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
