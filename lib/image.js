'use strict';

var gm = require('gm');
var dataURI = require('data-uri-to-buffer');
var GIFReducer = require('gif-reducer');

var reducer = new GIFReducer();

var regSize = 500;
var smSize = 300;
var currSize = 500;

var MAX_SIZE = 700000;

var respond = function (buffered, contentType, next) {
  if (buffered.length > MAX_SIZE) {
    console.log('resizing smaller');
    currSize = smSize;
  }

  gm(buffered, 'image.' + contentType)
    .options({ imageMagick: true })
    .resize(currSize, currSize)
    .toBuffer(contentType, function (err, buffer) {
      console.log('final ', buffer.length)
      if (err) {
        next(err);
        return;
      }

      next(null, 'data:image/' + contentType + ';base64,' + buffer.toString('base64'));
    });
};

var reduceAndProcess = function (buffered, next) {
  var contentType = buffered.type.split('/')[1].toLowerCase();

  if (contentType === 'gif') {
    reducer.buffer = buffered;

    reducer.reduce(function (err, newBuffer) {
      if (err) {
        next(err);
        return;
      }

      respond(newBuffer, contentType, next);
    });
  } else {
    respond(buffered, contentType, next);
  }
};

exports.resize = function (img, next) {
  try {
    var buffered = dataURI(img);

    if (buffered.length > 1000000) {
      next(new Error('File is too big'));
      return;
    }

    reduceAndProcess(buffered, next);
  } catch (err) {
    next(err);
  }
};