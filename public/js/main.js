$(function() {
  var services = [];
  var servicesEl = $('#services');
  var servicesAdd = $('.services-added');
  var maxLimit = $('.max-limit');

  $('.online').click(function () {
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
  });

  $('.reset').click(function () {
    services = [];
    servicesAdd.empty();
    servicesEl.val('');
    $('.content').val('');
  });
});