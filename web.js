var express = require('express');
var fs = require('fs');
var FILE_DEFAULT = "index.html";

var app = express.createServer(express.logger());

var message = function (file) {
  file = file || FILE_DEFAULT;
	var buffer = new Buffer(fs.readFileSync(file));
	return (buffer.toString());
}
	
app.get('/', function(request, response) {
  response.send(message());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
