# deliver

Serve local and remote static files.

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
  
  deliver(req, res, {
    root: process.cwd() // OPTIONAL
  }).pipe(res);
  
}).listen(3000);
```

#### Remote file (proxy)

```js
var deliver = require('deliver');
var http = require('http');

http.createServer(function (req, res) {
  // Conditionally set the request url
  req.url = '/somefile.html';
  
  deliver(req, res, {
    root: 'http://www.somewhere.com'
  }).pipe(res);
  
}).listen(3000);
```

## deliver(req, res,[, options])

Returns a stream almost identical to the [`send` module](https://www.npmjs.org/package/send). That means you can listen to the same events (i.e. *directory*, *error*, etc).

* `req` - the request object
* `res` - the response object
* `options`
  * `root` - set the root directory that holds the static files to serve. This can be a path or a url
  * `index` - set a custom index file. Pass `false` to disable or pass a string or array of strings for a custom index file.
  * `contentType` - override the content type
  
## Run Tests

```
npm install
npm test
```