/**
 *  Load dependencies
 */

var express   = require('express')
    , stylus    = require('stylus')
    , expose    = require('express-expose')
    , mongoose  = require('mongoose')
    , nib       = require('nib')
    , S         = require('string'); // Utility Class http://stringjs.com/

/**
 *  Exports
 */

module.exports = function(app){

  //  Setup DB Connection

  var dblink = process.env.MONGOHQ_URL || 'mongodb://localhost/fourfiftynine';

  var db  = mongoose.createConnection(dblink);

  // use nib + debug options
  function compile(str, path) {
    var linenos = process.env.NODE_ENV == 'local';
    return stylus(str)
      .set('linenos', linenos)
      .set('filename', path)
      .include(nib.path);
  }

  //  Configure expressjs

  app.configure(function (){
    this
      .use(express.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:response-time ms\033[0m'))
      .use(express.cookieParser())
      .use(express.bodyParser())
      .use(express.errorHandler({dumpException: true, showStack: true}))
      .use(express.session({ secret: 'faFka1@$aGsja'}))
  });

  //  Add template engine

  app.configure(function(){
    this
      .set('views', __dirname + '/../app/views')
      .set('view engine', 'jade')
      .use(stylus.middleware(
      { 
        src: __dirname + '/../public', 
        compile: compile 
      }))
      .use(express.static(__dirname + '/../public'))
  });

  //  Save reference to database connection
  
  app.configure(function () {
    app.set('db', { 
        'main': db
      , 'projects': db.model('Project')
    })
    app.set('version', '0.0.1');
  });
  // // Left Off here
  // app.configure(function () {
  //   this
  //     .use(function(req, res, next) {
  //       console.log(res.app.route);
  //       // res.app.route
  //       var locals = {
  //         body_class: (res.app.route === '/') ? 'home' : S(res.app.route).replaceAll('/', ' ').ltrim().s,
  //       }
  //       next();
  //       return { locals: locals };
  //   })
  // });

  // console.log(app);

  // setLocalVariables = function(req, res, next) {
  //   var locals = {
  //     body_class: (req.route.path === '/') ? 'home' : S(req.route.path).replaceAll('/', ' ').ltrim().s,
  //   }
  //   return { locals: locals };
  // }

  return app;
}