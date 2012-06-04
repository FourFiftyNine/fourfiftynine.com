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
    
    // TODO... make more obvious / semantic
    main.$content.find('>section').addClass('active'); // TODO make useful
    main.$content.find('>#projects>article').addClass('active'); // TODO make useful
    console.log(main.$content.find('>section'));
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
            main.toggleSpinner();
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
                main.toggleSpinner();
                main.$content.append(main.$spinner);
                $('#success-message').animate({'opacity': 1}, 'fast');
                $(form).resetForm();
              });

            }
        //     console.log('status: ' + status + '\n\nresponseText: \n' + jsonResponse + 
        // '\n\nThe output div should have already been updated with the responseText.');

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
        main.getContent(e, pushedUrl);
        e.preventDefault();
      })
    }
  },

  getContent: function(e, href) {
    // TODO delegate contact events
    var href = href || location.pathname
    var pathParts = href.split('/');
        pathParts.shift(); // shift empty string off beginning // wil break further down on root / home

    var newSectionId = null;
    var newProjectId = null;
    var isProjectsSectionLoaded = $('#projects').length;

    if (pathParts.length > 1 && pathParts[0] == 'projects') {
      newSectionId = pathParts[0];
      newProjectId = pathParts[1];
    } else if (pathParts[0] == 'projects') {
      newSectionId = 'projects-list'; 
    } else {
      newSectionId = pathParts[0];
    }


    if( newProjectId && isProjectsSectionLoaded ) {
      var $newProject = $('#' + newProjectId);
      // console.log($newProject);
      if( !$newProject.length ) { // check if project is loaded 
        // console.log('AJAX Load New Project: ', newProjectId);
        main.ajaxLoadNewProject(href, newProjectId)
      } else { // project already loaded
        main.toggleProjects(newProjectId)
      }
    } else {
      // console.log('here', newSectionId);
      var $newSection = $('#' + newSectionId)
      if( !$newSection.length ) {
        console.log('AJAX Loading New Section: ', newSectionId);
        main.ajaxLoadNewSection(href, newSectionId);
      } else { // section already loaded
        main.toggleSections(newSectionId);
      }
    }
    history.pushState(null, null, href);
  },
  ajaxLoadContent: function(href, newSectionId, newProjectId, callback) {
    $.ajax({
        url: href,
        method: 'post',
        dataType: 'HTML',
        data: {},
        success: function(data) {
          if( newProjectId ) {
            var $newContent = $(data).find('#' + newProjectId).appendTo('#projects');
            // TODO prev and next links
          } else {
            var $newContent = $(data).find('#' + newSectionId).appendTo('#content');
          }
          callback($newContent); // TODO rename
        }
    });
  },
  ajaxLoadNewSection: function(href, newSectionId) {
    $('section.active').fadeOut(500, function() {
      $(this).removeClass('active');
      main.toggleSpinner();
      main.ajaxLoadContent(href, newSectionId, null, function($newContent) {
        main.toggleSpinner();
        if( newSectionId == 'projects' ) { // first time loading projects section
          $newContent.find('article').addClass('active');
        }
        $newContent.fadeIn(500, function() {
          $(this).addClass('active');
        });
      });
    });
  },
  toggleSections: function(newSectionId) {
    if( $('section.active').attr('id') != newSectionId ) { // TODO - check if active... good place?
      console.log('toggling sections already loaded');
      $('section.active').fadeOut(500, function() {
        $(this).removeClass('active');
        $('#' + newSectionId).addClass('active').fadeIn(500);
      });
    } else {
      console.log('section already active');
    }
  },
  ajaxLoadNewProject: function(href, newProjectId) {
    console.log('AJAX Load New Project: ', newProjectId);
    var $projectsSection = $('#projects');
    if ( !$projectsSection.hasClass('active') ) {  // project section not active
      $('section.active').fadeOut(500, function() { // fade out current section
        $projectsSection.find('>article').removeClass('active').hide() // remove active from all projects and display:none
        $(this).removeClass('active'); // remove current section activeness
        main.toggleSpinner();
        main.ajaxLoadContent(href, null, newProjectId, function($newContent) {
          main.toggleSpinner();
          $newContent.show().addClass('active');
          $projectsSection.fadeIn(500, function() {
            $(this).addClass('active')
          });
        });
      });
    } else { // prev & next arrows
      // $('#projects').addClass('active');
      $projectsSection.find('article.active').fadeOut(500, function() {
        $(this).removeClass('active');
        main.ajaxLoadContent(href, null, newProjectId, function($newContent) {
          main.toggleSpinner();
          $newContent.fadeIn(500, function() {
            $(this).addClass('active');
            main.toggleSpinner();
          });
        });
      });
    }
    

  },
  toggleProjects: function(newProjectId) { // TODO combine with toggleSections
    console.log('PROJCSCASSDA');
    if( $('#projects article.active').attr('id') != newProjectId ) { // TODO - check if active... good place?
      console.log('toggling project already loaded');
      $('#projects article.active').fadeOut(500, function() {
        $(this).removeClass('active');
        $('#' + newProjectId).addClass('active').fadeIn(500);
      });
    } else {
      console.log('section already active');
    }
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