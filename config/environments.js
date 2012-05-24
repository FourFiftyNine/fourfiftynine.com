var Pusher   = require('pusher')

module.exports = function(app){
 
  var port = process.env.PORT || 4000
    , push;
 
  app.configure('local', function (){

    // Setup pusher

    push = new Pusher({
        appId  : '20483'
      , appKey : '43147abf3df9be2cce23'
      , secret : 'cd5935473680059cf5b2'
    })

    this
      .set('host', 'localhost')
      .set('port', port)
      .set('ENV','local')
  }); 
  
  app.configure('production', function (){

    // Setup pusher

    push = new Pusher({
        appId  : 'YOUR_PUSHER_APP_ID'
      , appKey : 'YOUR_PUSHER_APP_KEY'
      , secret : 'YOUR_PUSHER_SECRET_KEY'
    })

    this
      .set('host', '50.116.10.181')
      .set('port', port)
      .set('ENV','production')
  });

  // Set pusher
  app
    .set('pusher', { 'project': push.channel('project') })
    .set('pusher_key', push.options.appKey)

  return app
  
}