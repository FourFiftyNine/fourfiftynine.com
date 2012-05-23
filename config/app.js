/**
 * Load dependencies
 */
 
const express       = require('express')
    , stylus        = require('stylus')
    , mongoose      = require('mongoose')
    , nib           = require('nib')
    , models        = require('./models')
    , config        = require('./config')
    , routes        = require('./routes')
    , environments  = require('./environments')
    , errors        = require('./errors')
    , hooks         = require('./hooks')
    , helpers       = require('./helpers');
    

/**
 * Exports
 */
     
module.exports = function () {

  //  Create Server

  const app = express.createServer()
  
  // Load helpers
  app.dynamicHelpers ({
    page_title: helpers.creator(),
    view_body_class: helpers.creator(),
    body_classes: function(req, res) { return helpers.body_classes(req, res); }
  });

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