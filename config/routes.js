module.exports = function(app){

  var projects   = require('../app/controllers/project_controller')(app);
  
  //  Load database and pass it down to the controllers
  
  var db = app.set('db');

  //  Load Root
  
  app.get('/', projects.index); // *Root
  
  //  Load Project Controller + Routes
  
  app.get('/projects', projects.index); 
  app.post('/create', projects.create);
  app.post('/update', projects.update);
  app.post('/delete', projects.delete);

}