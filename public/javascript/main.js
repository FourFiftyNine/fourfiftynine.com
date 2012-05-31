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

    main.onClickContactFormNavigation();
    // $('.contact select').chosen({disable_search_threshold: 20});
    // bind window resize
    $window.resize(function() {
      main.setCopyCSSPosition();
    });

    $.validator.addMethod("phoneUS", function(phone_number, element) {
        phone_number = phone_number.replace(/\s+/g, ""); 
      return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
    }, "Please specify a valid phone number");

    $.validator.setDefaults({
      rules: {
        name: "required",
        email: {
          required: true,
          email: true
        },
        message: "required",
        tel: {
          required: true,
          phoneUS: true
        },
        date: {
          required: true,
          date: true
        }
      },
      messages: {
        name: "Please specify your name",
        email: {
          required: "Please specify your email",
          email: "Please enter a valid email"
        },
        message: "Please enter a message",
        tel: {
          required: "Please enter a phone number",
          phoneUS: "Please enter a phone number"
        },
        date: {
          required: "Choose a date",
          date: "Invalid date"
        }
      },
      submitHandler: function( form ) {
        $(form).ajaxSubmit(function() {
          alert('validated');
        })
      }
    })
    $('#project-message, #send-message').each(function() {
      $(this).validate();
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

  // TODO check for clicking already active form
  onClickContactFormNavigation: function() {
    var $contactFormNav = $('#contact-form-navigation');
    var $contactFormNavLink = $contactFormNav.find('a');
    var $contactPageH1= $contactFormNav.siblings('header').find('h1');
    $contactFormNavLink.click(function(e) {

      var formIDPrefix = $(this).attr('href');
      var contactPageTitle = $(this).attr('title');

      // create callback on animate but `this` scope is an ass
      $('.contact-form.active').animate({opacity: 0}, 600).removeClass('active');
      $contactFormNavLink.removeClass('active');
      $(this).addClass('active');
      console.log(formIDPrefix);
      $(formIDPrefix + '-message')
        .css('opacity', 0)
        .addClass('active')
        .animate({opacity: 100}, 600);

      $contactPageH1.text(contactPageTitle);
      e.preventDefault();

    });
  },
  // now responsive - duh

  fadeInContent: function() {
    main.$content.delay(400).animate({opacity: 1}, 400);

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