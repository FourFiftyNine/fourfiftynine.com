// Set all global variables 

var controller = {}
  , app
  , db
  , jade = require('jade')
  , fs = require('fs')
  , nodemailer = require('nodemailer');

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
 * Submit Email
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api public
 * @url /contact
 */ 

controller.submit = function(req, res, next){
  var post = req.body,
      errors = [];

  if( post.form == 'Message' )
    post.organization = post.date = post.tel = post.budget = 'N/A';
  
  // https://github.com/andris9/Nodemailer
  // create reusable transport method (opens pool of SMTP connections)
  var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
          user: "no-reply@fourfiftynine.com",
          pass: "brgNpio5biE"
      }
  });

  // http://stackoverflow.com/a/7294279/361689
  var jadefile = fs.readFileSync(process.cwd() + '/app/views/emails/contact.jade');
  var jadetemplate = jade.compile(jadefile.toString('utf8'));
  var html = jadetemplate(post);

  var mailOptions = {
      from: "4:59 | Contact Form <no-replay@fourfiftynine.com>", // sender address
      to: "sessa@fourfiftynine.com", // list of receivers
      subject: post.form, // Subject line
      // text: "Hello world ✔", // plaintext body
      html: html
  }

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }

      // if you don't want to use this transport object anymore, uncomment following line
      smtpTransport.close(); // shut down the connection pool, no more messages
  });
}