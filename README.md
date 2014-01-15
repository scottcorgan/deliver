# deliver

Serve static files locally OR remotely. An "in between" helper that figures out what you really want.

## Install

```
npm install deliver --save
```

## Usage

#### Local file

```js
var deliver = require('deliver');
var http = require('http');

http.createServer(function (req, res) {
  // Conditionally set the request url
  req.url = '/some';
  deliver(req).pipe(res);
}).listen(3000);
```

#### Remote file (proxy)

```js
var deliver = require('deliver');
var http = require('http');

http.createServer(function (req, res) {
  // Conditionally set the request url
  req.url = 'http://www.somewhere.com/somefile.html';
  deliver(req).pipe(res);
}).listen(3000);
```

## deliver(path[, options])

Returns a stream

* `path` - the path, relative or an http url, of the file to server
* `options`
  * `root` - set the root directory that holds the static files to serve
  
## Run Tests

```
npm install
npm test
```