'use strict';

var Publico = require('meatspace-publico');

var publico = new Publico('revisit', {
  db: './db/images'
});

var TTL = 60000 * 10;

exports.addImage = function (content) {
  publico.addChat(content, { ttl: TTL }, function (err) {
    if (err) {
      console.error('could not save image');
      return;
    }

    return;
  });
};

exports.getRecent = function (request, reply) {
  publico.getChats(true, function (err, images) {
    if (err) {
      reply.view('error', {
        reason: 'No images could be retrieved :('
      });
      return;
    }

    reply.view('recent', {
      images: images.chats
    });
  });
};