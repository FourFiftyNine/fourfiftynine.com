/**
 * Load dependencies
 */
 
var express       = require('express')
    , stylus        = require('stylus')
    , mongoose      = require('mongoose')
    , nib           = require('nib')
    , models        = require('./models')
    , config        = require('./config')
    , routes        = require('./routes')
    , environments  = require('./environments')
    , errors        = require('./errors')
    , hooks         = require('./hooks')
    , helpers       = require('./helpers')
    , compressor  = require('node-minify');

    

/**
 * Exports
 */
     
module.exports = function () {

  //  Create Server
  var app = express.createServer()
  // Compress JavaScript
  // Using UglifyJS
  new compressor.minify({
      type: 'uglifyjs',
      fileIn: [
        'public/javascript/libs/jquery.form.js',
        'public/javascript/libs/cycle/jquery.cycle.all.js',
        'public/javascript/plugins.js',
        'public/javascript/main.js', 
      ],
      fileOut: 'public/javascript/all.min.js',
      tempPath: 'tmp/',
      callback: function(err){
          // console.log(err);
      }
  });

  new compressor.minify({
      type: 'yui-css',
      fileIn: 'public/stylesheets/style.css',
      fileOut: 'public/stylesheets/compressed.css',
      tempPath: 'tmp/',
      callback: function(err){
          // console.log(err);
      }
  });
  // Load helpers
  app.dynamicHelpers ({
    page_title: helpers.creator(),
    view_body_class: helpers.creator(),
    body_classes: function(req, res) { return helpers.body_classes(req, res); }
  });

  // helpers(app);

  //  Load Mongoose Models
  
  models(app);
  
  //  Load Expressjs config
  
  config(app);
  
  //  Load Environmental Settings
  
  environments(app);

  //  Load routes config
  
  routes(app);
  
  //  Load error routes + pages
  
  errors(app);

  //  Load hooks

  hooks(app);

  // app.dynamicHelpers(require('./helpers.js').dynamicHelpers);

  return app;
  
};