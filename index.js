var send = require('send');
var defaults = require('defaults');
var request = require('request');
var isUrl = require('is-url');
var url = require('fast-url-parser');
var mime = require('mime-types');
var urlJoin = require('url-join');

var defaultOptions = {
  statusCode: 200,
  root: ''
};

var deliver = function (req) {
  var options = defaults(arguments[1], defaultOptions);
  
  if (isUrl(options.root)) {
    return request(urlJoin(options.root, req.url)).on('response', function (res) {
      if (options.statusCode) res.statusCode = options.statusCode;
      
      res.headers['content-type'] = options.contentType || mime.lookup(req.url)
    });
  }
  
  return send(req, url.parse(req.url).pathname, options);
};

module.exports = deliver;