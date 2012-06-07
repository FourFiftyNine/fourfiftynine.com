module.exports = function(app){

  var static     = require('../app/controllers/static_controller')(app);
  var projects   = require('../app/controllers/project_controller')(app);
  var admin      = require('../app/controllers/admin_controller')(app);
  var contact      = require('../app/controllers/contact_controller')(app);
  
  //  Load database and pass it down to the controllers
  
  // var db = app.set('db');
  var db = app.settings.db;

  //  Load Root
  
  app.get('/', static.home); // *Root
  // app.get('/contact', static.contact); // *contact
  app.get('/about', static.about); // *contact
  app.get('/technology', static.technology); // *contact
  
  //  Load Project Controller + Routes
  
  app.get('/projects', projects.index); 
  app.get('/projects/:name', projects.view); 
  app.post('/create', projects.create);
  app.post('/update', projects.update);
  app.post('/delete', projects.delete);

  // Load administration / login Controller + Routes

  app.get('/login', admin.login);
  app.post('/login', admin.login); 
  app.get('/logout', admin.logout); 
  // app.get('/admin', checkAuth, admin.index);
  app.get('/admin', checkAuth, admin.index);
  // app.post('/update', admin.update);
  // app.post('/delete', admin.delete);

  // Contact Submission
  
  app.get('/contact', contact.index); // contact
  app.post('/contact', contact.submit); // contact

  // Todo move into module
  function checkAuth(req, res, next) {
    if (!req.session.auth) {
      res.redirect('/login')
    // todo another else if for /login to redirect to admin 
    } else {
      next();
    }
  }

}