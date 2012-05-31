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


controller.index = function(req, res, next){
  res.render('contact/index');
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

controller.submit = function(req, res, next){
  var post = req.body,
      errors = [];
  console.log(post.form);
  if (post.username == 'sessa' && post.password == '123123') {
    req.session.auth = true;
    res.redirect('/admin'); 
  } else {
    if (post.hasOwnProperty('username') && post.hasOwnProperty('password')) {
        errors.push('Bad username or password');
    } else {
      // res.send('Please supply a username and password'.);
    }
    res.render('contact/index', {
      errors: errors
    });
  }
}