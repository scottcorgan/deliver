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
  
  console.log('TEST: req.url: ' + req.url);
  console.log('TEST: options', options);
  
  // Remote
  if (isUrl(options.root)) {
    
    console.log('TEST: is url');
    console.log('TEST: url proxy request: ' + urlJoin(options.root, req.url));
    
    delete req.headers.host;
    
    return request(urlJoin(options.root, req.url), {
      headers: req.headers
    }).on('response', function (res) {
      if (options.statusCode) res.statusCode = options.statusCode;
      res.headers['content-type'] = options.contentType || mime.lookup(req.url.split('?')[0])
    });
  }
  
  // Local
  var sendStream = send(req, url.parse(req.url).pathname, options);
  
  if (options.statusCode) {
    sendStream.on('headers', function (res, path, stat) {
      res.statusCode = options.statusCode;
    });
  }
  
  return sendStream;
};

module.exports = deliver;