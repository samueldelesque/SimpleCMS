var static = require("node-static"),
	rootpath = process.cwd()+"/public/sites/"
	// file = new static.Server(rootpath),
	disregardFiles = [".DS_Store",".hide",".git",".deleteme"],
	port = 1802,
	fs    = require('fs'),
	cdns = {}

// Dynamically build a list of sites based on the folders in /public/sites
fs.readdir(rootpath,function(err,folders){
	if(err){ console.error("Could not open sites dir!",err); return;}

	folders.forEach(function(url){
		if(disregardFiles.indexOf(url) == -1){
			// generate a CDN for a given site
			cdns[url] = new static.Server(rootpath+url);
		}
	});
});

require('http').createServer(function (request, response) {
	var host_parts = request.headers.host.replace(/http(s)?:\/\//g,'').split(":");
	var host = host_parts[0];

	request.addListener('end', function () {
		if(!cdns[host]){
			console.log("CDN not found",host);
			return
		}
		cdns[host].serve(request, response);
	}).resume();
}).listen(port);

console.log("App files are now served on port "+port);