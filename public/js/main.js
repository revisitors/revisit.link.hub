var $ = require('jquery');
var ImageView = require('imageview');

var services = [];
var servicesEl = $('#services');
var servicesAdd = $('.services-added');
var maxLimit = $('.max-limit');
var serviceList = $('#service-list');
var create = $('#create');
var body = $('body');
var fileAdded = false;

var iv = new ImageView({
  quality: 0.5,
  maxSize: 600
});

iv.preview();

var checkValid = function () {
  if (services.length > 0 && fileAdded) {
    create.addClass('on');
  } else {
    create.removeClass('on');
  }
};

body.on('change', '#photo-picker', function () {
  fileAdded = true;
  checkValid();
});

body.on('click', '.online', function () {
  if (services.length < 4) {
    services.push($(this).find('.url').text());

    servicesAdd.text(services.join(' => '));
    servicesEl.val(services.join(','));
  }

  checkValid();
});

$.get('/services', function (data) {
  $('#token').val(data.token);
  serviceList.empty();

  data.services.forEach(function (d) {
    var li = $('<li><span class="status"> &#9733;</span></li>');
    var url = $('<span class="url"></span>');
    var description = $('<p class="description"><span></span><img></p>');
    url.text(d.url);
    description.find('span').text(d.description);
    description.find('img').attr('src', d.sample);

    if (d.online) {
      li.addClass('online');
    }

    li.append(url).append(description);
    serviceList.append(li);
  });
});

body.on('click', '#reset', function () {
  services = [];
  servicesAdd.empty();
  servicesEl.val('');
  create.removeClass('on');
});
