// FourFiftyNine.com

/*jshint asi: false, browser: true, curly: true, devel: true, eqeqeq: false, forin: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: true, Spinner:false */

(function( window, $, undefined ) {
'use strict';

// global doesnt exist anywhere else yet
var CDLIX     = window.CDLIX || {};
var history   = window.history;
var History   = window.History; // History.js - github
var location  = window.location;
var Modernizr = window.Modernizr;
var $window   = $(window);
var $document = $(document);

var main = CDLIX.main = {

  init: function() {
    
    main.$content = $('#content'); // goodness
    main.$article = $('#content > article'); // ehhh meh
    main.$spinner = $('#spinner'); // div containing spinner for css manipulation

    // PUSHSTATE SETUP
    main.setupInternalHelper();
    main.setupAjaxification();
    main.setupHistory();
    main.onStateChange();

    main.initSlider();

    main.fadeInContent();

    // TODO change to delegation - $.on()
    if( ~location.pathname.indexOf('contact') ) { 
      main.setupContactBindings();
    }

    // $('.contact select').chosen({disable_search_threshold: 20});
    // bind window resize
    $window.resize(function() {
      main.setCopyCSSPosition();
    });

  },
  setupHistory: function() {
    if ( !History.enabled ) {
      return false;
    }

    main.contentSelector = '#content';
    main.$content = $(main.contentSelector).filter(':first');
    main.contentNode = main.$content.get(0);
    main.$menu = $('nav').filter(':first');
    main.activeClass = 'active';
    main.activeSelector = '.active,.selected,.current,.youarehere';
    main.menuChildrenSelector = '> ul > li';
    /* Application Generic Variables */
    main.$body = $(document.body);
    main.rootUrl = History.getRootUrl();
    main.$body.ajaxify();

  },
  setupInternalHelper: function() {
    $.expr[':'].internal = function(obj, index, meta, stack){
      // Prepare
      var
        $this = $(obj),
        url = $this.attr('href')||'',
        isInternalLink;
      
      // Check link
      isInternalLink = url.substring(0,main.rootUrl.length) === main.rootUrl || url.indexOf(':') === -1;
      
      // Ignore or Keep
      return isInternalLink;
    };
  },
  documentHTML: function(html) {
    var result = String(html)
      .replace(/<\!DOCTYPE[^>]*>/i, '')
      .replace(/<(html|head|body|title|meta|script)([\s\>])/gi,'<div class="document-$1"$2')
      .replace(/<\/(html|head|body|title|meta|script)\>/gi,'</div>')
    ;

    // Return
    return result;
  },
  setupAjaxification: function(){
    $.fn.ajaxify = function(){
      // Prepare
      var $this = $(this);
      
      // Ajaxify
      $this.find('a:internal:not(.no-ajaxy)').click(function(event){
        // Prepare
        var
          $this = $(this),
          url = $this.attr('href'),
          title = $this.attr('title')||null;
        
        // Continue as normal for cmd clicks etc
        if ( event.which == 2 || event.metaKey ) { return true; }
        
        // Ajaxify this link
        History.pushState(null,title,url);
        event.preventDefault();
        return false;
      });
      
      // Chain
      return $this;
    }
  },
  onStateChange: function() {
    $(window).bind('statechange',function(){
      // Prepare Variables
      var
        State = History.getState(),
        url = State.url,
        relativeUrl = url.replace(main.rootUrl,'');

      // Set Loading
      main.$body.addClass('loading');

      // Start Fade Out
      // Animating to opacity to 0 still keeps the element's height intact
      // Which prevents that annoying pop bang issue when loading in new content
      // main.$content.animate({opacity:0},660);
      main.$content.fadeOut(660);
      
      // Ajax Request the Traditional Page
      $.ajax({
        url: url,
        success: function(data, textStatus, jqXHR){
          // Prepare
          var
            $data = $(main.documentHTML(data)),
            $dataBody = $data.find('.document-body:first'),
            $dataContent = $dataBody.find(main.contentSelector).filter(':first'),
            $menuChildren, contentHtml, $scripts;
          
          // console.log($dataContent);
          var section = $dataContent.find('section').attr('id');
          // console.log(section);

          // Fetch the scripts
          $scripts = $dataContent.find('.document-script');
          if ( $scripts.length ) {
            $scripts.detach();
          }

          // Fetch the content
          contentHtml = $dataContent.html()||$data.html();
          if ( !contentHtml ) {
            document.location.href = url;
            return false;
          }
          
          // Update the menu
          $menuChildren = main.$menu.find(main.menuChildrenSelector);
          $menuChildren.filter(main.activeSelector).removeClass(main.activeClass);
          $menuChildren = $menuChildren.has('a[href^="'+relativeUrl+'"],a[href^="/'+relativeUrl+'"],a[href^="'+url+'"]');
          if ( $menuChildren.length === 1 ) { $menuChildren.addClass(main.activeClass); }

          // Update the content
          main.$content.stop(true,true);

          // main.$content.html(contentHtml).ajaxify().css('opacity',100).show(); /* you could fade in here if you'd like */
          main.$content.html(contentHtml).ajaxify();
          if ( section === 'home' ) {
            main.initSlider();
          } else if ( section === 'contact' ) {
            main.setupContactBindings();
          }
          main.$content.fadeIn(660);
          // Update the title
          document.title = $data.find('.document-title:first').text();
          try {
            document.getElementsByTagName('title')[0].innerHTML = document.title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
          }
          catch ( Exception ) { }
          
          // Add the scripts
          $scripts.each(function(){
            var $script = $(this), scriptText = $script.text(), scriptNode = document.createElement('script');
            console.log($script);
            scriptNode.appendChild(document.createTextNode(scriptText));
            contentNode.appendChild(scriptNode);
          });

          // Complete the change
          if ( main.$body.ScrollTo||false ) { main.$body.ScrollTo(scrollOptions); } /* http://balupton.com/projects/jquery-scrollto */
          main.$body.removeClass('loading');
    
          // // Inform Google Analytics of the change
          // if ( typeof window.pageTracker !== 'undefined' ) {
          //   window.pageTracker._trackPageview(relativeUrl);
          // }
          // console.log(relativeUrl);
          if ( typeof window._gaq !== 'undefined' ) {
            window._gaq.push(['_trackPageview', '/' + relativeUrl]); 
            // console.log('trackPageView', href);
          }

          // Inform ReInvigorate of a state change
          if ( typeof window.reinvigorate !== 'undefined' && typeof window.reinvigorate.ajax_track !== 'undefined' ) {
            reinvigorate.ajax_track(url);
            // ^ we use the full url here as that is what reinvigorate supports
          }
        },
        error: function(jqXHR, textStatus, errorThrown){
          document.location.href = url;
          return false;
        }
      }); // end ajax

    }); // end onStateChange
  },
  validationSetup: function() {
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
  setupContactBindings: function() {
    main.onClickContactFormNavigation();
    main.validationSetup();
    main.onContactFormSubmit();
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
        main.togglingContent = false;
        main.initialLoad = false;

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