
var Schema = require('mongoose').Schema
    , ObjectId = Schema.ObjectId;

/**
 * Schema.
 */

var Project = module.exports = new Schema({
    title         : { type: String, required: true }
  , overview      : { type: String, required: true }
  , specs         : { type: String, required: true }
  , tags          : { type: String, required: false }
  , is_active     : { type: Boolean, default:true }
  , date_created  : { type: Date, default: Date.now }
  , date_updated  : { type: Date } 
})

/**
 * Get Latest Posts
 *
 * @param {Callback} callback
 *
 * @api public
 */
Project.statics.getLatestPosts = function(callback){
  return this.find().sort('_id','descending').limit(15).find({}, callback)
}

Project.statics.getProjectByName = function(name) {
  // return this.find();
}

//this happens before it saves, they are called middleware

Project.pre('save', function(next){
  console.log('Saving...');
  next();
});

//this happens before it removes, they are called middleware

Project.pre('remove', function(next){
  console.log('removing...');
  next();
});

//this happens when it inititializes, they are called middleware

Project.pre('init', function(next){
  console.log('initializing...');
  next();
});
