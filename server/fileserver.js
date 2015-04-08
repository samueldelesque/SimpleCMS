var static = require("node-static"),
	public_path = process.cwd()+"/public"
	file = new static.Server(public_path),
	port = 1002

	console.log(public_path);

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(port);

console.log("App files are now served on port "+port);