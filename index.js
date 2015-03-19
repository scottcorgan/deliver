var send = require('send');
var defaults = require('defaults');
var request = require('hyperquest');
var isUrl = require('is-url');
var url = require('fast-url-parser');
var mime = require('mime-types');
var join = require('join-path');
var zlib = require('zlib');
var onHeaders = require('on-headers');
var compressible = require('compressible');
var accepts = require('accepts');

var defaultOptions = {
  statusCode: 200,
  root: ''
};

var deliver = function (req, res, _options, done) {
  var options = defaults(_options, defaultOptions);
  var headers = options.headers;
  
  // Add/remove specified headers
  if (headers) {
    Object.keys(headers).forEach(function (key) {
      // Delete a header if the value passed in is null
      if (headers[key] === null && req.headers[key]) delete req.headers[key];
      else if (headers[key] === null && req.headers[key.toLowerCase()]) delete req.headers[key.toLowerCase()];
      else if (headers[key]) req.headers[key] = headers[key];
    });
  }
  
  // compression method
  var accept = accepts(req);
  var method = accept.encoding(['gzip', 'deflate', 'identity']);
  
  // we really don't prefer deflate
  if (method === 'deflate' && accept.encoding(['gzip'])) {
    method = accept.encoding(['gzip', 'identity']);
  }
  
  // Remove all headers
  if (headers === null) req.headers = {};
  
  // Remote
  if (isUrl(options.root)) {
    var contentType = options.contentType || mime.lookup(req.url.split('?')[0]);
    var isCompressible = compressible(contentType);
    
    onHeaders(res, function () {
      if (!res.getHeader('Content-Type')) {
        
        // Ensure utf-8 charset in content-type header
        // for content types that start with "text/" like "text/html"
        if (/^text\//.test(contentType)) {
          contentType = mime.contentType(contentType);
        }
        
        res.setHeader('Content-Type', contentType);
        
      }
      
      res.setHeader('Content-Encoding', method);
      
      // Remove content length header because it's not needed
      // when the repsonse is chunked to the browser
      if (method === 'gzip') {
        res.removeHeader('Content-Length');
      }
    });
    
    var r = request({
      uri: join(options.root, req.url),
      headers: req.headers
    }, function (err, rr) {
      if (err) return;
      
      // TODO: test this
      res.emit('content-length', rr.headers ? rr.headers['content-length'] : 0);
    });
    
    // Handle inflate/deflate response stream
    return (method === 'gzip' && options.gzip !== false)
      ? r.pipe(zlib.createGzip())
      : r;
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