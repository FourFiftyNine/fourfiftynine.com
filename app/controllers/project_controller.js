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

controller.index = function(req, res, next){

  // expose pusher key
  
  res.expose({ 
      app_key   : req.app.set('pusher_key') 
    , channel   : 'project'
    , events    : 'project'
  }, 'PUSHER')

  // render template
  res.render('projects/index');
  // res.render('index', {
  //   projects: db.projects.getLatestPosts()
  // });
}

controller.view = function(req, res, next){
  var name = req.params.name;
  if (req.is('json')) {
    // console.log(name);
    res.json({name: name});
  } else {
    var data = require('../views/projects/json/' + name + '.json');
    // console.log('json:', data);
    res.render('projects/view', data);
  }
}

/**
 * Create Project
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api public
 * @url /create
 */

controller.create = function(req, res, next){
  
  var ProjectModel = db.main.model('Project')
    , Project     = new ProjectModel(req.param('project'));

  Project.save(projectSaved)

  function projectSaved(err){
    if (err) return next(err)
    res.partial('project', { object: Project }, function(err, html){
      if (err) return next(err)

      // Send the hook

      req.app.emit('event:create_project', { prepend: html, to: '#projects' }, req)

      // Send response

      res.send({ prepend: html, to: '#projects' });
    });
  }
}


/**
 * Update Project
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api public
 * @url /delete
 */

controller.update = function(req, res, next){
  
  var ProjectModel = db.main.model('Project')
    , Project     = req.param('project');

  ProjectModel.update( {_id : Project.id } , Project, projectUpdated);

  function projectUpdated(err){
    if (err) return next(err)

      // Send the hook
      
      req.app.emit('event:update_project', {update: Project, target : Project.id }, req)

      // Send response

      res.send({ update: Project, target : Project.id });
  }
}


/**
 * Delete Project
 *
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback} next
 *
 * @api public
 * @url /delete
 */

controller.delete = function(req, res, next){
  
  var Project = db.main.model('Project');

  Project.remove( {_id : req.param('id')} , projectRemoved);

  function projectRemoved(err){
    if (err) return next(err)

      // Send the hook
      
      req.app.emit('event:delete_project', {remove: true, target : req.param('id') }, req)

      // Send response

      res.send({ remove: true,  target : req.param('id') });
  }
}