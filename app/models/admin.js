
const Schema = require('mongoose').Schema
    , ObjectId = Schema.ObjectId;

/**
 * Schema.
 */

var Admin = module.exports = new Schema({
    name          : { type: String, required: true }
  , password      : { type: String, required: true }
  , email         : { type: String, required: true }
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
Admin.statics.getLatestPosts = function(callback){
  return this.find().sort('_id','descending').limit(15).find({}, callback)
}

//this happens before it saves, they are called middleware

Admin.pre('save', function(next){
  console.log('Saving...');
  next();
});

//this happens before it removes, they are called middleware

Admin.pre('remove', function(next){
  console.log('removing...');
  next();
});

//this happens when it inititializes, they are called middleware

Admin.pre('init', function(next){
  console.log('initializing...');
  next();
});
