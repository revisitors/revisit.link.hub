var $ = require('jquery');
var services = [];
var servicesEl = $('#services');
var servicesAdd = $('.services-added');
var maxLimit = $('.max-limit');
var ImageView = require('imageview');
var serviceList = $('#service-list');
var create = $('#create');
var token = $('.token');
var body = $('body');

var iv = new ImageView({
  quality: 0.5,
  maxSize: 600
});

iv.preview();

body.on('click', '.online', function () {
  if (services.length < 4) {
    services.push($(this).find('.url').text());

    servicesAdd.text(services.join(' => '));
    servicesEl.val(services.join(','));
  } else {
    maxLimit.addClass('on');

    setTimeout(function () {
      maxLimit.removeClass('on');
    }, 2500);
  }

  if (services.length > 0 && $('#photo').val().length > 0) {
    create.addClass('on');
  } else {
    create.removeClass('on');
  }
});

$.get('/services', function (data) {
  token.text(data.token);
  $('#token').val(data.token);

  data.services.forEach(function (d) {
    var li = $('<li><span class="status"> &#9733;</span></li>');
    var url = $('<span class="url"></span>');
    var description = $('<p class="description"></p>');
    url.text(d.url);
    description.text(d.description);

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
  $('#preview').empty();
  $('.content, #photo').val('');
  create.removeClass('on');
});
