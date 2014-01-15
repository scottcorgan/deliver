var send = require('send');
var defaults = require('defaults');
var request = require('request');
var isUrl = require('is-url');

var defaultOptions = {
  root: ''
};

var deliver = function (req) {
  if (isUrl(req.url)) return request(req.url)
    
  var options = defaults(arguments[1], defaultOptions);
  
  return send(req, req.url).root(options.root);
};

module.exports = deliver;