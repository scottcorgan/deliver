var send = require('send');
var path = require('path');
var defaults = require('defaults');
var request = require('request');
var isUrl = require('is-url');

var join = path.join;
var normalize = path.normalize;
var defaultOptions = {
  root: ''
};

var deliver = function (req) {
  if (isUrl(req.url)) return request(req.url)
    
  var options = defaults(arguments[1], defaultOptions);
  var root = join(process.cwd(), normalize(options.root));
  
  return send(req, req.url).root(root)
};

module.exports = deliver;