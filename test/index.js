var fs = require('fs');
var senator = require('../');
var test = require('tape');
var through = require('through');

test('serves static files', function (t) {
  var res = createResponse();
  var filename = 'test/testfile1.txt';
  fs.writeFileSync(filename,'testfile1');
  
  senator(filename).pipe(res);
  
  streamBuffer(res, function (err, contents) {
    t.equal(contents, 'testfile1', 'streamed file');
    fs.unlinkSync(filename);
    t.end();
  });
});

test('serves static files with root', function (t) {
  var res = createResponse();
  var filename = 'test/testfile2.txt';
  fs.writeFileSync(filename, 'testfile2');
  
  senator('testfile2.txt', {
    root: '/test'
  }).pipe(res);
  
  streamBuffer(res, function (err, contents) {
    t.equal(contents, 'testfile2', 'streamed file');
    fs.unlinkSync(filename);
    t.end();
  });
});

test('serves static with mime type', function (t) {
 var res = createResponse();
   var filename = 'test/testfile3.txt';
   fs.writeFileSync(filename,'testfile3');
   
   senator(filename).pipe(res);
   
   streamBuffer(res, function (err, contents) {
     t.equal(contents, 'testfile3', 'streamed file');
     t.equal(res['Content-Type'], 'text/plain', 'set mime type');
     fs.unlinkSync(filename);
     t.end();
   });
});

// test('handles file static file serving error');

function streamBuffer (stream, callback) {
  var contents = '';
  
  stream
    .on('data', function (data) {
      contents += data.toString();
    })
    .on('error', callback)
    .on('end', function () {
      callback(null, contents);
    });
};

function createResponse () {
  var res = through();
  res.setHeader = function (header, value) {
    res[header] = value;
  };
  
  return res;
}