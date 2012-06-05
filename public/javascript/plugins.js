window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

// https://raw.github.com/gist/1290439/ce7face0309bdb265244e8483ce91dcf86e8cb14/jquery.spin.js
/*

You can now create a spinner using any of the variants below:

$("#el").spin(); // Produces default Spinner using the text color of #el.
$("#el").spin("small"); // Produces a 'small' Spinner using the text color of #el.
$("#el").spin("large", "white"); // Produces a 'large' Spinner in white (or any valid CSS color).
$("#el").spin({ ... }); // Produces a Spinner using your custom settings.

$("#el").spin(false); // Kills the spinner.

*/
(function($) {
  $.fn.spin = function(opts, color) {
    var presets = {
      "tiny": { lines: 8, length: 2, width: 2, radius: 3 },
      "small": { lines: 8, length: 4, width: 3, radius: 5 },
      "large": { lines: 10, length: 8, width: 4, radius: 8 }
    };
    if (Spinner) {
      return this.each(function() {
        var $this = $(this),
          data = $this.data();
        
        if (data.spinner) {
          data.spinner.stop();
          delete data.spinner;
        }
        if (opts !== false) {
          if (typeof opts === "string") {
            if (opts in presets) {
              opts = presets[opts];
            } else {
              opts = {};
            }
            if (color) {
              opts.color = color;
            }
          }
          data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
        }
      });
    } else {
      throw "Spinner class not available.";
    }
  };
})(jQuery);

// IE font-face ClearType fix - V0.1
// Authord by Michael Strand of Allcreatives.net
// Usage, changes, FAQ etc. see - http://allcreatives.net/2009/12/05/jquery-plugin-ie-font-face-cleartype-fix/
// The IE font-face ClearType fix plugin is dual licensed under the [MIT](http://www.opensource.org/licenses/mit-license.php) and 
// [GPL](http://www.opensource.org/licenses/gpl-license.php) licenses.

// There is one configuration setting to be changed below if you have the PNG image in different location from this file.

(function($) {
    $.fn.ieffembedfix = function() {
    
    // CONFIGURE THE PATH TO YOUR 1BY1 PNG HERE, RELATIVE TO THE LOCATION OF THIS JS FILE.
    
    var pngimgurl = "hIEfix.png";
    
    return this.each(function() {
        //check for IE7/8
        if (jQuery.support.objectAll == false) {
            $(this).css({
            
            filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + pngimgurl + ",sizingMethod=crop',
            zoom: '1'
            });
        }
        });
    }
})(jQuery);
