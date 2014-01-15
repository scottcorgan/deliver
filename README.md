# senator

Serve static files locally OR remotely

## Install

```
npm install senator --save
```

## Usage

#### Local file

```js
var senator = require('senator');
var http = require('http');

http.createServer(function (req, res) {
  // Conditionally set the request url
  req.url = '/some';
  senator(req).pipe(res);
}).listen(3000);
```

#### Remove file (proxy)

```js
var senator = require('senator');
var http = require('http');

http.createServer(function (req, res) {
  // Conditionally set the request url
  req.url = 'http://www.somewhere.com/somefile.html';
  senator(req).pipe(res);
}).listen(3000);
```

## senator(path[, options])

Returns a stream

* `path` - the path, relative or an http url, of the file to server
* `options`
  * `root` - set the root directory that holds the static files to serve
  
## Run Tests

```
npm install
npm test
``