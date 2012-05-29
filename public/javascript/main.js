// FourFiftyNine.com
// main.js - Used in all views

/*jshint asi: false, browser: true, curly: true, devel: true, eqeqeq: false, forin: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: true */

(function( window, $, undefined ) {

'use strict';

// global doesnt exist anywhere else yet
var CDLIX     = window.CDLIX || {};
var history   = window.history;
var location  = window.location;
var Modernizr = window.Modernizr;
var $window   = $(window);
var $document = $(document);

var main = CDLIX.main = {

  init: function() {
    
    main.$content   = $('#content');
    main.$article   = $('#content > article');
    main.$copy       = $('#content #projects #copy');
    
    // TODO... make more obvious / semantic
    main.$content.find('>section').addClass('active'); // TODO make useful
    main.fadeInContent();
    main.setCopyCSSPosition();

    // bind window resize
    $window.resize(function() {
      main.setCopyCSSPosition();
    });
  },

  setCopyCSSPosition: function() {
    var h = $window.height();
    var p = 'position';
    var f = 'fixed';
    var s = 'static';
    var $inPageNavigation = main.$copy.find('#in-page-navigation');
    // console.log(h);
    // console.log(main.$copy.height());
    if(main.$copy.height() > h) {
      main.$copy.css(p, s);
      // TODO figure out navigation with static copy
      // $inPageNavigation.css(p, f);
      // $inPageNavigation.css('bottom', '')

    } else {
      main.$copy.css(p, f);
    }
  },
  // now responsive - duh
  resizeContent: function() {
    if ( true /* $('.body').hasClass('home') */ ) {
      var sidebarWidth = $('#navigation').innerWidth();
      var h = $(window).height();
      var w = $(window).width();
      var $images = $('#images');
      var contentWidth = (w - sidebarWidth);

      $("#content").css('width', contentWidth);
      // $('.screenshots').css('height', h);
      // TODO golf it - bogeyed out right now
      if ( contentWidth < 540 ) {
        $images.css('width', 270);
      } else if (contentWidth < 810) {
        $images.css('width', 540);
      } else if ( contentWidth < 1080 ) {
        $images.css('width', 810);
      } else if ( contentWidth < 1350 ) {
        $images.css('width', 1080);
      } else if ( contentWidth >= 1350 ) {
        $images.css('width', 1350);
      }
    }
    // var copyWidth = $('.copy').outerWidth(true);
    // var screenShotsMarginLeft = copyWidth + 40;
    // TODO split into separate resize function
    if ( $('#projects').hasClass('active') ) {


      if(w < 1300) {
        var copyMarginRight = 20;
        var posRight = 10;
      } else {
        var copyMarginRight = 30;
        var posRight = 35;
      }
      $('.arrow.next').css('right', sidebarWidth + posRight);

      var copyMarginLeft = parseInt($('#copy').css('marginLeft')); //
      var screenshotsOffsetLeft = $('.screenshots').offset().left;
      $('#copy').css('width', screenshotsOffsetLeft - copyMarginLeft - copyMarginRight)
      // $('.screenshots > img').css('height', h - 80);
    }
  },

  fadeInContent: function() {
    main.$content.delay(400).animate({opacity: 1}, 250);

  }
};
/* Residual code from initial project
  
  // var pusher = new Pusher(PUSHER["app_key"]);
  // var channel = pusher.subscribe(PUSHER["channel"]);

  // channel.bind(PUSHER["events"], function(data) {
  //   response(data);
  // });
  

  // create data
  
  $('#create').submit(function(){
    var data = $(this).serialize();
    console.log(data);
    $.post('/create', data, function(res){
      if(!res.error){
        // Do something!
      }
    });
    return false;
  });
  
  //delete data

  $('#projects')
    .delegate('a', 'click', function() {
      if($(this).hasClass('delete')){
        var data = { id : $(this).parent().attr('id') };
        $.post('/delete', data, function(res){
          if(!res.error){
            // Do something!
          }
        });
      }
      else if($(this).hasClass('edit')){
        $(this).next('form').toggleClass('edit-mode');
      }
      return false;
    })
    .delegate('form', 'submit', function(){
      $(this).toggleClass('edit-mode');
      var data = $(this).serialize();
      $.post('/update', data, function(res){
        if(!res.error){
          // Do something!
        }
      });
      return false;
    })
  ;


// utility functions

function notify(type, msg, duration) {
  if (!msg) msg = type, type = 'info';
  duration = duration || 2000;
  var el = $('<li class="' + type + '">' + msg + '</li>');
  $('#flash').append(el);
  setTimeout(function(){ remove(el); }, duration);
}

// add elements to page

function response(res) {
  if (res.error) {
    notify('error', res.error);
  } else {
    if (res.message) {
      notify(res.message); 
    }
    if (res.prepend) {
      $(res.to).prepend(res.prepend).hide().fadeIn();
    }
    if (res.append) {
      $(res.to).append(res.append);
    }
    if (res.update) {
      var post = $('#'+res.target);
      // need to change this part for something more optimized
      post.find('h3').text(res.update.title);
      post.find('input[type="text"]').attr('value', res.update.title);
      post.find('p').text(res.update.body);
      post.find('textarea').text(res.update.body);
    }
    if (res.remove) {
      $('#'+res.target).fadeOut(function(){
        $('#'+res.target).remove();
      });
    }
    if ($('#noposts')) {
      $('#noposts').remove();
    }
  }
}

*/

$document.ready( main.init );
})( window, jQuery );