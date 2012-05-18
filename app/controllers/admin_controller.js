// Set all global variables 

var controller = {}
  , app
  , db

// Constructor

module.exports = function (_app) {
  app = _app
  db  = app.set('db')
  return controller
}

/**
 * Login Admin
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api public
 * @url /login
 */ 

controller.login = function(req, res, next){
  var post = req.body,
      errors = [];
  if (post.username == 'sessa' && post.password == '123123') {
    req.session.auth = true;
    res.redirect('/admin'); 
  } else {
    if (post.hasOwnProperty('username') && post.hasOwnProperty('password')) {
        errors.push('Bad username or password');
    } else {
      // res.send('Please supply a username and password'.);
    }
    res.render('admin/login', {
      errors: errors
    });
  }
}

/**
 * Logout Admin
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api public
 * @url /logout
 */

controller.logout = function(req, res, next){
  if (typeof req.session !== 'undefined') {
    console.log('logout?');
    delete req.session.auth;
  } 
  res.redirect('/login');
}

/**
 * Admin Dashboard
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api private
 * @url /admin
 */

controller.index = function(req, res, next){
  // checkAuth(req, res, next);
  // res.send('test this auth2');
  var errors = [];
  res.render('admin/index', {
    errors: errors
  });
}