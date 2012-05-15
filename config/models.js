/**
 * Load dependencies
 */

const mongoose = require('mongoose');

require('express-mongoose');  

/**
 * Exports
 */
 
module.exports = function(){
  
  //  Load Project model
  
  mongoose.model('Project', require('../app/models/project'));

}