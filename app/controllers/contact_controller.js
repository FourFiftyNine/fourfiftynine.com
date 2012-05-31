// Set all global variables 

var controller = {}
  , app
  , db
  , email = require('mailer');

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

  email.send({
      host : "smtp.gmail.com",
      port : "465",
      ssl : true,
      domain : "fourfiftynine.com",
      to : "sessa@fourfiftynine.com",
      from : "contactform@fourfiftynine.com",
      subject : "New Project",
      body: "<b>Hello! This is a test of the node_mailer.</b>",
      authentication : "login",
      username : 'no-reply@fourfiftynine.com',
      password : 'brgNpio5biE'
      },
      function(err, result){
        if(err){  console.log(err); return;}
        else console.log('looks good')
  });

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