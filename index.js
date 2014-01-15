var fs = require('fs');
var send = require('send');
var path = require('path');
var join = path.join;
var normalize = path.normalize;

var defaults = {
  root: ''
};

var senator = function (pathname) {
  var options = arguments[1] || defaults;
  var filepath = join(
    process.cwd(),
    options.root,
    normalize(pathname)
  );
  var fileStream = fs.createReadStream(filepath);
  
  return {
    on: function (evt, callback) {},
    pipe: function (res) {
      res.setHeader('Content-Type', mime.lookup(filepath));
      return fileStream.pipe(res);
    }
  }
};

module.exports = senator;