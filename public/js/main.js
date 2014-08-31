var $ = require('jquery');
var ImageView = require('imageview');

var services = [];
var servicesEl = $('#services');
var servicesAdd = $('.services-added');
var maxLimit = $('.max-limit');
var serviceList = $('#service-list');
var create = $('#create');
var body = $('body');
var form = $('form');
var loading = $('#loading');
var fileAdded = false;
var token = $('.token');
var statusRow = $('.status-message-row');

var iv = new ImageView({
  quality: 0.5,
  previewSize: 500
});

iv.preview();

function renderSelectedServices(services) {
  var serviceItems = $.map(services, function (s, idx) {
    return '<li data-index="' + idx + '">' + s.title + '</li>';
  });

  var serviceData = $.map(services, function (s, idx) {
    return s.url;
  });

  servicesAdd.toggleClass('active', !!services.length).html(serviceItems);
  servicesEl.val(serviceData.join(','));
  checkValid();
}

function checkValid() {
  if (services.length > 0 && fileAdded) {
    create.removeAttr('disabled');
  } else {
    create.attr('disabled', true);
  }
}

body.on('change', '#photo-picker', function () {
  $('#preview').css('display', 'block');
  fileAdded = true;
  checkValid();
});

body.on('click', '.online', function () {
  if (services.length < 5) {
    services.push($(this).data());
    renderSelectedServices(services);
  } else {
    servicesAdd.addClass('alert');

    setTimeout(function () {
      servicesAdd.removeClass('alert');
    }, 1500);
  }

  checkValid();
});

servicesAdd.on('click', 'li', function () {
  var idx = parseInt(this.getAttribute('data-index'), 10);
  services.splice(idx, 1);
  renderSelectedServices(services);
});

$.get('/services', function (data) {
  $('#token').val(data.token);
  token.text(data.token);
  serviceList.empty();

  data.services.forEach(function (d) {
    var li = $('<li class="service-list-item"></li>');
    var preview = $('<div class="image-preview"><img /></div>');
    var title = $('<h4 />');

    li.data({ title: d.description, url: d.url });
    preview.find('img').attr('src', d.sample);
    title.text(d.description);

    if (d.online) {
      li.addClass('online');
    }

    li.append(preview, title);
    serviceList.append(li);
  });
});

form.on('submit', function () {
  create.find('span').text('Processing, please wait!');
  create.prop('disabled', true);
});

body.on('click', '#reset', function () {
  services = [];
  renderSelectedServices(services);
  servicesEl.val('');
  create.removeClass('on');
  $('#preview').empty();
  $('.content').val('');
});

body.on('click', '#imgur', function (e) {
  e.preventDefault();
  var imgurBtn = $('#imgur');
  var imgurKey = imgurBtn.data('imgurKey');
  var authorization = 'Client-ID ' + imgurKey;
  var imageUri = $('.result img').attr('src').replace(/^data:[^,]+,/, '');

  $.ajax('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      Authorization: authorization,
      Accept: 'application/json'
    },
    data: {
      image: imageUri,
      type: 'base64'
    }
  }).done(function (result) {
      var id = result.data.id;
      statusRow.html('<a href="https://imgur.com/gallery/' + id + '">Image Uploaded</a>');
    })
    .error(function (result) {
      var message = result.responseJSON.data.error || 'Error: ' + result.status + ': ' + result.statusText;
      statusRow.html('<div>' + message + '</div>');
    })
    .always(function () {
      imgurBtn.removeAttr('disabled');
    });

  imgurBtn.attr('disabled', true);
});
