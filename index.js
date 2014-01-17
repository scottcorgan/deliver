var path = require('path');
var send = require('send');
var defaults = require('defaults');
var request = require('request');

var defaultOptions = {
  root: ''
};

var deliver = function (req) {
  if (isUrl(req.url)) return request(req.url);
    
  var options = defaults(arguments[1], defaultOptions);
  req.url = path.join(options.root, req.url);
  
  return send(req, req.url);
};

function isUrl (str) {
  var matcher = /^(ftp|https?):\/\/([^\s\.]+\.[^\s]{2,}|localhost[\:?\d]*)$/;
  return matcher.test(str);
}

module.exports = deliver;