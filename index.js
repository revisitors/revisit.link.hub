'use strict';

var Hapi = require('hapi');
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
      handler: services.home
    }
  },
  {
    method: 'GET',
    path: '/services',
    config: {
      handler: services.getAll
    }
  },
  {
    method: 'POST',
    path: '/service',
    config: {
      payload: {
        maxBytes: 3000000
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
      path: './dist',
      listing: false,
      index: false
    }
  }
});

server.pack.register({
  plugin: require('crumb')
}, function (err) {
  if (err) {
    throw err;
  }
});

server.start();
