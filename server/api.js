var http = require('http'),
	fs    = require('fs'),
	watch = require('node-watch'),
	root_url = process.cwd(),
	Site = require(root_url+"/server/includes/site"),
	port = 1001,
	cdn_port = 1002,
	urls = [],
	sites = {},
	disregardFiles = [".DS_Store",".hide",".git",".deleteme"],
	prev = function(){}

// Dynamically build a list of sites based on the folders in /public/sites
fs.readdir(root_url+"/public/sites",function(err,folders){
	if(err){ console.error("Could not open sites dir!",err); return;}

	folders.forEach(function(url){
		if(disregardFiles.indexOf(url) == -1){
			// generate a new Site and parse its content
			sites[url] = new Site({host:url,scripts:[]}).render();

			// watch folder for changes
			watch(root_url+"/public/sites/"+url, function(filename) {
				console.log(url," had updated content.");
				sites[url].render();
			});
		}
	});
});

http.createServer(function (request, response) {
	var host_parts = request.headers.host.replace(/http(s)?:\/\//g,'').split(":");
	var host = host_parts[0];

	// Set default site to be shown as fallback
	if(!sites[host]){host = "localhost";}

	// cdn set to cdn.site.com by default if not local
	if(host == "localhost") GLOBAL.cdn = "http://0.0.0.0:"+cdn_port+"/sites/"
	else GLOBAL.cdn = "http://104.236.54.11:1002/sites/"

	var url = request.url.split("/")
	var page = url[1].split(".");
	if(page.length == 2 && page[1] == "html"){

		// Show HTML
		response.writeHead(200, {
			'Content-Type': 'text/html',
			'Access-Control-Allow-Origin' : '*'
		});
		sites[host].html(page[0],function(html){
			response.end(html);
		});
	}
	else{

		// send back JSON data
		response.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : '*'
		});
		response.end(JSON.stringify(sites[host].getData(page[0])));
	}
}).listen(port);

console.log("Listening on port:"+port);