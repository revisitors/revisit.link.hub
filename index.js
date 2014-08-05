var Hapi = require('hapi');
var Joi = require('joi');
var nconf = require('nconf');

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
      handler: getServices,
      validate: {
        query: {
          name: Joi.string()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/message',
    config: {
      handler: sendToService
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
  reply.view('index', {
    title: 'revisit.link.hub',
    message: 'test'
  });
}

function sendToService(request, reply) {
  console.log('sending service');
}
