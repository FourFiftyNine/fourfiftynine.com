// Set all global variables 

var pusher = require('pusher')
  , controller = {}
  , app
  , db

// Constructor

module.exports = function (_app) {
  app = _app
  db  = app.set('db')
  return controller
}

/**
 * Index Project
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api public
 * @url /
 * @url /projects
 */

controller.home = function(req, res, next){

  // expose pusher key
  
  res.expose({ 
      app_key   : req.app.set('pusher_key') 
    , channel   : 'project'
    , events    : 'project'
  }, 'PUSHER')

  // render template
  res.render('static/home');
  // res.render('index', {
  //   projects: db.projects.getLatestPosts()
  // });
}

controller.contact = function(req, res, next){

  res.render('static/contact');

}