'use strict';

var gm = require('gm');
var dataURI = require('data-uri-to-buffer');

var regSize = 500;
var smSize = 400;
var currSize = 500;

exports.resize = function (img, next) {
  console.log('resizing')
  try {
    var buffered = dataURI(img);
    var contentType = buffered.type.split('/')[1].toLowerCase();

    if (buffered.length > 800000) {
      // If image is greater than 900 KB, we'll drop the resize amount
      console.log('resizing smaller');
      currSize = smSize;
    }

    gm(buffered, 'image.' + contentType)
      .options({ imageMagick: true })
      .resize(currSize, currSize)
      .toBuffer(contentType, function (err, buffer) {
        if (err) {
          throw err;
        }

        next(null, 'data:image/' + contentType + ';base64,' + buffer.toString('base64'));
      });
  } catch (err) {
    next(err);
  }
};