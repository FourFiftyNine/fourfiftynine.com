var S = require('String');

exports.create = function () {
    var value = null;
    return {
        get: function () {
           return value;
        },
        set: function (new_value) {
           value = new_value;
        }
    };
}

exports.creator = function () {
    return function () {
        return exports.create();
    };
}

// LEOF
// The class attribute is special-cased when an array is given, allowing you to pass an array such as bodyClasses = ['user', 'authenticated'] directly:

// body(class=bodyClasses)
exports.body_classes = function(req, res){
  // console.log(module);
  if(typeof req.url !== 'undefined')
    return (req.url === '/') ? 'home' : S(req.url).replaceAll('/', ' ').ltrim().s;
}
