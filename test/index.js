var fs = require('fs');
var senator = require('../');
var test = require('tape');
var connect = require('connect');
var http = require('http');
var request = require('request');
var PORT = 9876;

// req.url = '/asdf.html';
// senator(req).pipe(res);

test('streams a static file', function (t) {
  var server = createServer(function (req, res) {
    req.url = '/test/fixtures/testfile1.txt';
    senator(req).pipe(res);
  }, function (err) {
    request.get('http://localhost:' + PORT, function (err, resp, body) {
      t.equal(resp.statusCode, 200, 'successful response');
      t.equal(body, 'testfile1', 'streamed file');
      server.close();
      t.end();
    });
  });
});

test('serves static files with root', function (t) {
  var server = createServer(function (req, res) {
    req.url = '/testfile1.txt';
    senator(req, {
      root: '/test/fixtures'
    }).pipe(res);
  }, function (err) {
    request.get('http://localhost:' + PORT, function (err, resp, body) {
      t.equal(resp.statusCode, 200, 'successful response');
      t.equal(body, 'testfile1', 'streamed file');
      server.close();
      t.end();
    });
  });
});

test('serves static with mime type', function (t) {
  var server = createServer(function (req, res) {
    req.url = '/test/fixtures/testfile1.txt';
    senator(req).pipe(res);
  }, function (err) {
    request.get('http://localhost:' + PORT, function (err, resp, body) {
      t.equal(resp.headers['content-type'], 'text/plain; charset=UTF-8', 'correct mime type');
      server.close();
      t.end();
    });
  });
});

test('servers a proxied remote file by url', function (t) {
  var fileServer = createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    fs.createReadStream('test/fixtures/testfile1.txt').pipe(res);
  }, function () {
    var server = createServer(function (req, res) {
      req.url = 'http://localhost:9875/testfile1.txt';
      senator(req).pipe(res);
    }, function (err) {
      request.get('http://localhost:' + PORT, function (err, resp, body) {
        
        t.equal(resp.headers['content-type'], 'text/plain; charset=UTF-8', 'correct mime type');
        t.equal(body, 'testfile1', 'streamed remote file');
        
        server.close();
        fileServer.close();
        t.end();
      });
    });
  }, 9875);
});

function createServer (testMiddleware, callback, _port) {
  var app = connect();
  app.use(testMiddleware);
  return http.createServer(app).listen(_port || PORT, callback);
}