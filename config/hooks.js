/**
 * Load hooks
 */

var ev = require('../app/hooks/event')

/**
 * Exports
 */

// Namespacing is recommended.

module.exports = function (app) {

  // Event hooks

  app.on('event:create_project', ev.create_project);
  app.on('event:update_project', ev.update_project);
  app.on('event:delete_project', ev.delete_project);

}