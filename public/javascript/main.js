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
    main.$spinner = $('#spinner'); // div containing spinner for css manipulation

    main.titleHistory = {};
    main.titleHistory[location.pathname] = document.title;
    main.togglingContent = false;

    main.$activeContent = main.setActiveContent();

    main.initSlider(); // TODO implement better detection.

    // TODO
    // $('h1, h2, h3, h4, h5, p').ieffembedfix();
    // TODO... make more obvious / semantic
    // main.$content.find('>section').addClass('active'); // TODO make useful
    // main.$content.find('>#projects>article').addClass('active'); // TODO make useful
    // console.log(main.$content.find('>section'));

    main.fadeInContent();

    // TODO change to delegation - $.on()
    if( ~location.pathname.indexOf('contact') ) { 
      main.onClickContactFormNavigation();
    }

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
            // move spinner into aside on contact page
            $('#contact-info').append(main.$spinner);
            main.toggleSpinner();
            window.document.activeElement.blur();
            // $(form).fadeOut(500, function() {
            //   main.$article.css('height', oldHeight);
            // })
          },
          success: function(data) {
            if( !data.errors ) {
              // TODO need to iterate errors array (util func)
              // console.log((data.errors));
            } else {
              // console.log(data.success);
              $('#success-message').text(data.success);
              main.$spinner.animate({'opacity': 0}, 'fast', function() {
                main.toggleSpinner();
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
    
    main.onContactFormSubmit();
    // TODO - needs to be after defaults above - not sure I like this


    ////// PUSHSTATE ///////
    // TODO delegate using jquery $.on();
    if (Modernizr.history) {
      window.addEventListener('popstate', main.getContent);

      $('body').on('click', 'a.pushstate', function(e) {
        var pushedUrl = $(this).attr('href');
        // main.toggleSpinner();
        main.getContent(e, pushedUrl);
        history.pushState(null, null, pushedUrl);
        // _gaq.push(['_trackPageview', pushedUrl]);
        e.preventDefault();
      });
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
    if ( typeof window._gaq !== 'undefined' ) {
      window._gaq.push(['_trackPageview', href]); 
      console.log('trackPageView', href);
    }
    // make sure we arent currently loading in content
    // right now this only follows the animation since we dont do true
    // async based animation
    if( main.togglingContent ) {
      return false;
    }
      
    // TODO delegate contact events
    href = href || location.pathname;
    var pathParts = href.split('/');
        pathParts.shift(); // shift empty string off beginning

    var newSectionId; 
    var newProjectId;

    if (pathParts.length > 1 && pathParts[0] === 'projects') {
      newSectionId = pathParts[0];
      newProjectId = pathParts[1];
    } else if (pathParts[0] === 'projects') {
      newSectionId = 'projects-list';
    } else if (pathParts[0] === '') {
      newSectionId = 'home';
      
    } else {
      newSectionId = pathParts[0];
    }

    var $newProject = $('#' + newProjectId);
    var $newSection = $('#' + newSectionId);

    if( $newProject.length ) {

      // console.log('Existing PROJECT In DOM');
      main.toggleContent(newSectionId, newProjectId);

    } else if( newProjectId ) {

      // console.log('AJAX Loading new project: ', newProjectId);
      main.ajaxLoadContent(href, newSectionId, newProjectId);
    // } else if ( newProjectId ) {
    //   main.ajaxLoadContent(href, newSectionId, newProjectId);
    } else if ( $newSection.length ) {

      // console.log('Existing SECTION In DOM');
      main.toggleContent(newSectionId);

    } else {
      // console.log('Ajax loading: ', newSectionId);
      main.ajaxLoadContent(href, newSectionId);
    }

    if( main.titleHistory[href] ) {
      document.title = main.titleHistory[href];
    }
  },

  ajaxLoadContent: function(href, newSectionId, newProjectId) {
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
            $(data).find('#' + newSectionId).appendTo('#content');
          }

          // Set and Save page title
          if(!main.titleHistory[href]) {
            main.titleHistory[href] = $(data).filter('title').text();
          }               
          document.title = main.titleHistory[href];
          main.toggleContent(newSectionId, newProjectId);

          // Update for google analytics (find source in ajaxify)
          // if ( typeof window.pageTracker !== 'undefined' ) {
          //   window.pageTracker._trackPageview(href);
          // }
        }
    });
  },
  // TODO - make state local global
  ajaxLoadContentSuccess: function(data, newSectionId, newProjectId) {

  },
  toggleContent: function(newSectionId, newProjectId) {

    var $newSection = $('#' + newSectionId);
    var $newProject = $('#' + newProjectId);

    main.togglingContent = true;


    // TODO check if contact form already loaded and bound?
    // console.log(main.contactFormBound);
    if( newSectionId == 'contact' ) {
      if( !main.contactFormBound ) { // TODO change to delegation? $.on()
        main.onClickContactFormNavigation();
      }
      main.onContactFormSubmit();
    }

    // TODO this nestedness is vomit
    // TODO hasClass, make into isActive() ??
    if( !$newSection.hasClass('active-content') && !$newProject.hasClass('active-content')) {

      if ( newProjectId ) { // if adding a project
        if ( $('#projects').length && $('#projects').hasClass('active-content') ) { // if projects exist already
          main.setPrevNextControls($newProject);
        } else {
          main.$activeContent.fadeOut(500, function() {
            $newProject.show().addClass('active-content');
            main.fadeInAndSetActiveContent($newSection);
            main.setPrevNextControls($newProject);
          });
          
        }
        
      } else { // if a normal section
        main.$activeContent.fadeOut(500, function() {
          main.fadeInAndSetActiveContent($newSection);
        });
      }
    } else if ($newSection.hasClass('active-content') && !$newProject.hasClass('active-content')) {
      main.$activeContent.find('article.active-content').fadeOut(500, function() {
        main.setPrevNextControls($newProject);
        $(this).removeClass('active-content');
        $newProject.fadeIn(500, function() {
          $(this).addClass('active-content');
          main.togglingContent = false;
        });
      });
      main.togglingContent = false;
    } else {
      // console.log('Content already active...do nothing');
      main.togglingContent = false;
    }
  },

  fadeInAndSetActiveContent: function($newActiveContent) {
    main.$activeContent.removeClass('active-content').children('.active-content').hide().removeClass('active-content');
    // if(Modernizr.csstransitions) {
    //   main.$activeContent = $newActiveContent.addClass('active-content');
    //   console.log('modernizr');
    //   return;
    // }

    $newActiveContent.fadeIn(500, function() {
      if( $(this).attr('id') == 'home' ) {
        main.initSlider();
      }
      main.$activeContent = $(this).addClass('active-content');
      main.togglingContent = false;
      main.setCopyCSSPosition();
    });
  },

  setPrevNextControls: function($content) {
    var $controls = $content.find('.controls');
    var projects = '/projects/';
    var prevSlug = $controls.attr('data-prev');
    var nextSlug = $controls.attr('data-next');

    if( prevSlug ) {
      $('#prev').attr('href', projects + prevSlug).removeClass('hidden');
    } else {
      $('#prev').addClass('hidden');
    }

    if( nextSlug ) {
      $('#next').attr('href', projects + nextSlug).removeClass('hidden');
    } else {
      $('#next').addClass('hidden');
    }
  },

  setCopyCSSPosition: function() {
    var windowHeight = $window.height();
    var fixedPos = 'fixed';
    var staticPos = 'static'; // static is reserved
    var $activeProjectCopy = $('#projects article.active-content .copy');

    // TODO find way to have the bottom navigation be fixed when scrolling with fixed copy
    // var $inPageNavigation = main.$copy.find('#in-page-navigation');
    // console.log(h);
    // console.log(main.$copy.height());

    if ( $activeProjectCopy.height() > windowHeight ) {
      $activeProjectCopy.css({
        position: staticPos,
        width: '40%'
      });
      // TODO figure out navigation with static copy
      // $inPageNavigation.css(p, f);
      // $inPageNavigation.css('bottom', '')

    } else {
      $activeProjectCopy.css({position: fixedPos, width: '35%'});
    }
  },

  onContactFormSubmit: function() {
    // console.log('here');
    $('#project-message, #send-message').each(function() {
      $(this).validate();
    });
  },
  // TODO check for clicking already active form
  onClickContactFormNavigation: function() {
    var $contactFormNav     = $('#contact-form-navigation');
    var $contactFormNavLink = $contactFormNav.find('a');
    var $contactPageH1      = $contactFormNav.siblings('header').find('h1');
    main.contactFormBound = true; // TODO change to delegation? $.on()
    
    $contactFormNavLink.click(function(e) {
      var $clicked         = $(this);
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
    if(!$('html').hasClass('lt-ie9')) {
      main.$content.delay(400).fadeIn(500, function() {
        main.setCopyCSSPosition(); // this is luckily here for now because of section.active set in the init()... yuck
      });
    }    
  },
  toggleSpinner: function() {
    if( main.spinner ) {
      main.spinner.stop();
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
      main.$spinner.animate({'opacity': 1}, 500);
    }
  },
  initSlider: function() {
    var $slideshow = $('#slideshow');
    if( !$slideshow.hasClass('initiated') && $slideshow.length ) {
      $slideshow.cycle({
        // fx: 'scrollHorz',
        slideExpr: '.slide',
        slideResize: 0,
        containerResize: 0,
        fit: 1,
        pager: '#slideshow-nav',
        after: function() {
          $slideshow.addClass('initiated');
        }
      });
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