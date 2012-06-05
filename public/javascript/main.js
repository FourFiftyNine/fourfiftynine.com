// FourFiftyNine.com
// main.js - Used in all views

/*jshint asi: false, browser: true, curly: true, devel: true, eqeqeq: false, forin: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: true, Spinner:false */

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
    
    main.$content = $('#content'); // goodness
    main.$article = $('#content > article'); // ehhh meh
    main.$copy    = $('#content #projects #copy'); // ehhh meh
    main.$spinner = $('#spinner'); // div containing spinner for css manipulation

    main.titleHistory = {};
    main.titleHistory[location.pathname] = document.title;

    main.$activeContent = main.setActiveContent();
    // TODO... make more obvious / semantic
    // main.$content.find('>section').addClass('active'); // TODO make useful
    // main.$content.find('>#projects>article').addClass('active'); // TODO make useful
    // console.log(main.$content.find('>section'));
    main.fadeInContent();

    main.onClickContactFormNavigation();
    // $('.contact select').chosen({disable_search_threshold: 20});
    // bind window resize
    $window.resize(function() {
      main.setCopyCSSPosition();
    });

    // bind validation to two contact forms on one page
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
          required: "Enter a date",
          date: "Invalid date (M/D/Y)"
        }
      },
      submitHandler: function( form ) {

        var options = {
          dataType: "json",
          beforeSubmit: function(formData, jqForm, options) {
            // spinner
            // var oldHeight = main.$article.height();
            $('#contact-info').append(main.$spinner);
            // main.toggleSpinner();
            main.$spinner.animate({'opacity': 1}, 500);
            window.document.activeElement.blur();
            // $(form).fadeOut(500, function() {
            //   main.$article.css('height', oldHeight);
            // })
          },
          success: function(data) {
            if( !data.errors ) {
              // TODO need to iterate errors array (util func)
              console.log((data.errors));
            } else {
              console.log(data.success);
              $('#success-message').text(data.success);
              main.$spinner.animate({'opacity': 0}, 'fast', function() {
                // main.toggleSpinner();
                main.$content.append(main.$spinner);
                $('#success-message').animate({'opacity': 1}, 'fast');
                $(form).resetForm();
              });

            }
          }
        };
        $(form).ajaxSubmit(options);
      }
    });

    // TODO - needs to be after defaults above - not sure I like this
    $('#project-message, #send-message').each(function() {
      $(this).validate();
    });


    ////// PUSHSTATE ///////
    // TODO delegate using jquery $.on();
    if (Modernizr.history) {
      window.addEventListener('popstate', main.getContent);
      $('body').on('click', 'a.pushstate', function(e) {
        var pushedUrl = $(this).attr('href');
        // main.toggleSpinner();
        main.getContent(e, pushedUrl);
        e.preventDefault();
      })
    }
  },
  setActiveContent: function() {

    if( $('#projects').length ) {
      
      $('#projects').addClass('active-content').find('article').addClass('active-content');
      return $('#projects');
    } else {
      return $('#content > section').addClass('active-content');
    }
  },
  getContent: function(e, href) {
    // TODO delegate contact events
    var href = href || location.pathname
    var pathParts = href.split('/');
        pathParts.shift(); // shift empty string off beginning // wil break further down on root / home

    var newSectionId; 
    var newProjectId;
    console.log(pathParts);

    if (pathParts.length > 1 && pathParts[0] == 'projects') {
      newSectionId = pathParts[0];
      newProjectId = pathParts[1];
    } else if (pathParts[0] == 'projects') {
      newSectionId = 'projects-list';
    } else if (pathParts[0] == '/') {
      newSectionId = 'home';
    } else {
      newSectionId = pathParts[0];
    }

    var $newProject = $('#' + newProjectId);
    var $newSection = $('#' + newSectionId);

    if( $newProject.length ) {

      console.log('Existing Project In DOM');
      main.toggleContent(newSectionId, newProjectId);

    } else if( newProjectId ) {

      // console.log('Existing projects section, but no project: ', newSectionId);
      main.ajaxLoadContent(href, newSectionId, newProjectId);
    // } else if ( newProjectId ) {
    //   main.ajaxLoadContent(href, newSectionId, newProjectId);
    } else if ( $newSection.length ) {

      console.log('Existing Section In DOM');
      main.toggleContent(newSectionId);

    } else {
      console.log('Ajax loading: ', newSectionId);
      main.ajaxLoadContent(href, newSectionId);
    }
    history.pushState(null, null, href);
    if( main.titleHistory[href] ) {
      document.title = main.titleHistory[href];
    }
  },
  ajaxLoadContent: function(href, newId, newProjectId) {
    // console.log(main.$activeContent);
        $.ajax({
            url: href,
            method: 'post',
            dataType: 'HTML',
            data: {},
            success: function(data) {
              if( $('#projects').length && newProjectId ) {
                $(data).find('#' + newProjectId).appendTo('#projects');
              } else {
                $(data).find('#' + newId).appendTo('#content');
              }
              if(!main.titleHistory[href]) {
                main.titleHistory[href] = $(data).filter('title').text();
              }               
              document.title = main.titleHistory[href];
              main.toggleContent(newId, newProjectId);

              if ( typeof window.pageTracker !== 'undefined' ) {
                window.pageTracker._trackPageview(href);
              }
            }
        });
  },
  toggleContent: function(newSectionId, newProjectId) {


    if( !$('#' + newSectionId).hasClass('active-content') && !$('#' + newProjectId).hasClass('active-content')) {

      if ( newProjectId ) { // if adding a project
        if ( $('#projects').length && $('#projects').hasClass('active-content') ) { // if projects exist already

        } else {
          main.$activeContent.fadeOut(500, function() {
            $(this).removeClass('active-content');
            $(this).children('.active-content').hide().removeClass('active-content');
            $('#' + newProjectId).show().addClass('active-content');
            $('#' + newSectionId).fadeIn(500, function() {
              main.$activeContent = $(this).addClass('active-content');
            });
            
          });
          
        }
        
      } else { // if a normal section
        main.$activeContent.fadeOut(500, function() {
          $(this).removeClass('active-content');
          $(this).children('.active-content').hide().removeClass('active-content');
          $('#' + newSectionId).fadeIn(500, function() {
            main.$activeContent = $(this).addClass('active-content');
          });
        });
      }
    } else {
      console.log('Content already active...do nothing');
    }
  },
  toggleProject: function() {

  },
  setCopyCSSPosition: function() {
    var windowHeight = $window.height();
    var position = 'position';
    var fixedPos = 'fixed';
    var staticPos = 'static'; // static is reserved
    var $inPageNavigation = main.$copy.find('#in-page-navigation');
    // console.log(h);
    // console.log(main.$copy.height());

    if ( main.$copy.height() > windowHeight ) {
      main.$copy.css(position, staticPos);
      // TODO figure out navigation with static copy
      // $inPageNavigation.css(p, f);
      // $inPageNavigation.css('bottom', '')

    } else {
      main.$copy.css(position, fixedPos);
    }
  },

  // TODO check for clicking already active form
  onClickContactFormNavigation: function() {
    var $contactFormNav     = $('#contact-form-navigation');
    var $contactFormNavLink = $contactFormNav.find('a');
    var $contactPageH1      = $contactFormNav.siblings('header').find('h1');
    $contactFormNavLink.click(function(e) {
      var $clicked            = $(this);
      var formIDPrefix     = $(this).attr('href');
      var contactPageTitle = $(this).attr('title');

      $contactFormNavLink.removeClass('active');
      $clicked.addClass('active');
      // create callback on animate but `this` scope is an ass
      $('.contact-form.active').animate({opacity: 0}, 500, function() {
        $(this).removeClass('active');

        // console.log(formIDPrefix);
        $(formIDPrefix + '-message')
          .css('opacity', 0)
          .addClass('active')
          .animate({opacity: 1}, 500, function() {
          });

        $contactPageH1.text(contactPageTitle);
      });

      e.preventDefault();

    });
  },
  // now responsive - duh

  fadeInContent: function() {
    main.$content.delay(400).animate({opacity: 1}, 400, function() {
      main.setCopyCSSPosition(); // this is luckily here for now because of section.active set in the init()... yuck
    });
    

  },
  toggleSpinner: function() {
    if( main.spinner ) {
      main.spinner.stop()
    } else {
      var opts = {
        lines: 13, // The number of lines to draw
        length: 22, // The length of each line
        width: 7, // The line thickness
        radius: 21, // The radius of the inner circle
        rotate: 0, // The rotation offset
        color: '#505050', // #rgb or #rrggbb
        speed: 1.4, // Rounds per second
        trail: 73, // Afterglow percentage
        shadow: true, // Whether to render a shadow
        hwaccel: true, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
      var target = document.getElementById('spinner');
      main.spinner = new Spinner(opts).spin(target);
    }
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