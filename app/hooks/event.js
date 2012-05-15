// Events

exports.create_project = function (data, req) {
  var pusher = req.app.set('pusher')
  pusher.project.trigger('project', data)
}

exports.update_project = function (data, req) {
  var pusher = req.app.set('pusher')
  pusher.project.trigger('project', data)
}

exports.delete_project = function (data, req) {
  var pusher = req.app.set('pusher')
  pusher.project.trigger('project', data)
}