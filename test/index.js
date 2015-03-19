var fs = require('fs');
var deliver = require('../');
var test = require('tape');
var connect = require('connect');
var http = require('http');
var request = require('request');
var pako = require('pako');
var PORT = 9876;

test('streams a static file', function (t) {
  var server = createServer(function (req, res) {
    req.url = __dirname + '/fixtures/testfile1.txt';
    
    deliver(req, res).pipe(res);
  }, function (err) {
    get('http://localhost:' + PORT, function (err, res, body) {
      t.equal(res.statusCode, 200, 'successful response');
      t.equal(body, 'testfile1', 'streamed file');
      server.close();
      t.end();
    });
  });
});

test('serves static files with root', function (t) {
  var server = createServer(function (req, res) {
    req.url = '/testfile1.txt';
    deliver(req, res, {
      root: __dirname + '/fixtures'
    }).pipe(res);
  }, function (err) {
    get('http://localhost:' + PORT, function (err, resp, body) {
      t.equal(resp.statusCode, 200, 'successful response');
      t.equal(body, 'testfile1', 'streamed file');
      server.close();
      t.end();
    });
  });
});

test('serves static with mime type', function (t) {
  var server = createServer(function (req, res) {
    req.url = __dirname + '/fixtures/testing.jpg?asdf=asdf&wefwef=asdasd';
    deliver(req, res).pipe(res);
  }, function (err) {
    get('http://localhost:' + PORT, function (err, resp, body) {
      t.equal(resp.headers['content-type'], 'image/jpeg', 'correct mime type');
      server.close();
      t.end();
    });
  });
});

test('streams the index file of a directory', function (t) {
  var server = createServer(function (req, res) {
    req.url = '/';
    deliver(req, res, {
      root: __dirname + '/fixtures'
    }).pipe(res);
  }, function (err) {
    get('http://localhost:' + PORT, function (err, resp, body) {
      t.equal(body, 'index', 'served index file');
      server.close();
      t.end();
    });
  });
});

test('serves a custom index file from a directory', function (t) {
  var server = createServer(function (req, res) {
    req.url = '/';
    deliver(req, res, {
      root: __dirname + '/fixtures',
      index: 'testfile1.txt'
    }).pipe(res);
  }, function (err) {
    get('http://localhost:' + PORT, function (err, resp, body) {
      t.equal(body, 'testfile1', 'served index file');
      server.close();
      t.end();
    });
  });
});

// test('sets status code when serving local files', function (t) {
//   var server = createServer(function (req, res) {
//     req.url = '/';
//     deliver(req, res, {
//       root: __dirname + '/fixtures',
//       statusCode: 404
//     }).pipe(res);
//   }, function (err) {
//     get('http://localhost:' + PORT, function (err, resp, body) {
//       t.equal(body, 'index', 'served index file');
//       t.equal(resp.statusCode, 404, 'set status code');
//       server.close();
//       t.end();
//     });
//   });
// });

test('serves a proxied remote file by url', function (t) {
  var fileServer = createServer(function (req, res) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    fs.createReadStream('test/fixtures/index.html').pipe(res);
  }, function () {
    var server = createServer(function (req, res) {
      req.url = '/index.html';
      deliver(req, res, {
        root: 'http://localhost:9875',
        gzip: false
      }).pipe(res);
    }, function (err) {
      get('http://localhost:' + PORT, function (err, resp, body) {
        t.equal(resp.statusCode, 200, '200 status code');
        t.equal(resp.headers['content-type'], 'text/html; charset=utf-8', 'correct mime type');
        t.equal(body, 'index', 'streamed remote file');
        
        server.close();
        fileServer.close();
        t.end();
      });
    });
  }, 9875);
});

// test('serves a proxied remote file with a custom response status code', function (t) {
//   var fileServer = createServer(function (req, res) {
//     fs.createReadStream('test/fixtures/testfile1.txt').pipe(res);
//   }, function () {
//     var server = createServer(function (req, res) {
//       req.url = '/testfile1.txt';
//       res.statusCode = 404;
      
//       deliver(req, res, {
//         root: 'http://localhost:9875',
//         statusCode: 404
//       }).pipe(res);
      
//     }, function (err) {
//       get('http://localhost:' + PORT, function (err, resp, body) {
//         t.equal(resp.statusCode, 404, '404 status code');
//         server.close();
//         fileServer.close();
//         t.end();
//       });
//     });
//   }, 9875);
// });

// test('passing in a file list will test for a file existence', function (t) {
  
// });

// TODO: test that it proxies a directories index.html file
// 
// TODO: test passing the headers through

test('serves a proxied remote file with a custom content mime type', function (t) {
  var fileServer = createServer(function (req, res) {
    fs.createReadStream('test/fixtures/testfile1.txt').pipe(res);
  }, function () {
    var server = createServer(function (req, res) {
      req.url = '/testfile1.txt';
      res.statusCode = 404;
      
      deliver(req, res, {
        contentType: 'text/html',
        root: 'http://localhost:9875',
        gzip: false
      }).pipe(res);
      
    }, function (err) {
      get('http://localhost:' + PORT, function (err, resp, body) {
        t.equal(resp.headers['content-type'], 'text/html; charset=utf-8', 'correct mime type');
        server.close();
        fileServer.close();
        t.end();
      });
    });
  }, 9875);
});

test('servers proxied remote file gzipped', function (t) {
  var fileServer = createServer(function (req, res) {
    fs.createReadStream('test/fixtures/testfile1.txt').pipe(res);
  }, function () {
    var server = createServer(function (req, res) {
      req.url = '/testfile1.txt';
      res.statusCode = 404;
      
      deliver(req, res, {
        root: 'http://localhost:9875'
      }).pipe(res);
      
    }, function (err) {
      get('http://localhost:' + PORT, {headers: {'accept-encoding': 'gzip'}}, function (err, resp, body) {
        // TODO: test actually gzipped response instead
        // of just headers
        t.equal(resp.headers['content-encoding'], 'gzip', 'gzipped header');
        server.close();
        fileServer.close();
        t.end();
      });
    });
  }, 9875);  
});

test('adds custom headers from request to remote file', function (t) {
  var r;
  
  var fileServer = createServer(function (req, res) {
    fs.createReadStream('test/fixtures/testfile1.txt').pipe(res);
  }, function () {
    var server = createServer(function (req, res) {
      r = req;
      
      req.url = '/testfile1.txt';
      res.statusCode = 404;
      
      deliver(req, res, {
        root: 'http://localhost:9875',
        gzip: false,
        headers: {
          test: 'test header'
        }
      }).pipe(res);
      
    }, function (err) {
      get('http://localhost:' + PORT, function (err, resp, body) {
        t.equal(r.headers.test, 'test header', 'removed test header');
        
        server.close();
        fileServer.close();
        t.end();
      });
    });
  }, 9875);  
});

test('removes headers from request to remote file', function (t) {
  var r;
  
  var fileServer = createServer(function (req, res) {
    fs.createReadStream('test/fixtures/testfile1.txt').pipe(res);
  }, function () {
    var server = createServer(function (req, res) {
      r = req;
      
      req.url = '/testfile1.txt';
      res.statusCode = 404;
      
      req.headers.test = 'test header';
      
      deliver(req, res, {
        root: 'http://localhost:9875',
        gzip: false,
        headers: {
          test: null
        }
      }).pipe(res);
      
    }, function (err) {
      get('http://localhost:' + PORT, function (err, resp, body) {
        t.equal(r.headers.test, undefined, 'removed test header');
        
        server.close();
        fileServer.close();
        t.end();
      });
    });
  }, 9875);  
});

test('removes all headers from request to remote file', function (t) {
  var r;
  
  var fileServer = createServer(function (req, res) {
    fs.createReadStream('test/fixtures/testfile1.txt').pipe(res);
  }, function () {
    var server = createServer(function (req, res) {
      r = req;
      
      req.url = '/testfile1.txt';
      res.statusCode = 404;
      
      req.headers.test = 'test header';
      
      deliver(req, res, {
        root: 'http://localhost:9875',
        gzip: false,
        headers: null
      }).pipe(res);
      
    }, function (err) {
      get('http://localhost:' + PORT, function (err, resp, body) {
        t.equal(r.headers.test, undefined, 'removed test header');
        
        server.close();
        fileServer.close();
        t.end();
      });
    });
  }, 9875);  
});

//
function createServer (testMiddleware, callback, _port) {
  var app = connect();
  app.use(testMiddleware);
  return http.createServer(app).listen(_port || PORT, callback);
}

function get (url, options, callback) {
  
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  var body = '';
  return request(url, options, callback);
}