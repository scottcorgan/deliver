var send = require('send');
var defaults = require('defaults');
var request = require('hyperquest');
var isUrl = require('is-url');
var url = require('fast-url-parser');
var mime = require('mime-types');
var urlJoin = require('url-join');
var zlib = require('zlib');
var onHeaders = require('on-headers');

var defaultOptions = {
  statusCode: 200,
  root: ''
};

var deliver = function (req, res, _options) {
  var options = defaults(_options, defaultOptions);
  var headers = options.headers;
  
  if (headers) {
    Object.keys(headers).forEach(function (key) {
      // Delete a header if the value passed in is null
      if (headers[key] === null && req.headers[key]) delete req.headers[key];
      else if (headers[key] === null && req.headers[key.toLowerCase()]) delete req.headers[key.toLowerCase()];
      else if (headers[key]) req.headers[key] = headers[key];
    });
  }
  
  // Remote
  if (isUrl(options.root)) {
    delete req.headers.host;
    delete req.headers['accept-encoding'];
    
    onHeaders(res, function () {
      res.setHeader('content-type', options.contentType || mime.lookup(req.url.split('?')[0]));
      if (options.gzip !== false) res.setHeader('content-encoding', 'gzip');
    });
    
    var r = request({
      uri: urlJoin(options.root, req.url),
      headers: req.headers
    });
    
    if (options.gzip !== false) return r.pipe(zlib.createGzip());
    
    return r;
  }
  
  // Local
  var sendStream = send(req, url.parse(req.url).pathname, options);
  
  // TODO: add this back when we can figure out
  //       how to set the status code in the proxy portion
  // if (options.statusCode) {
  //   sendStream.on('headers', function (res, path, stat) {
  //     res.statusCode = options.statusCode;
  //   });
  // }
  
  return sendStream;
};

module.exports = deliver;