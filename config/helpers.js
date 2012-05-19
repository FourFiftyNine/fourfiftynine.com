exports.create = function () {
    var value = null;
    return {
        get: function () {
           return value;
        },
        set: function (new_value) {
           value = new_value;
           console.log(value);
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
// exports.bodyClass = function(req, res){
//   console.log(req);
//   return (req.route.path === '/') ? 'home' : S(req.route.path).replaceAll('/', ' ').ltrim().s;
// }
