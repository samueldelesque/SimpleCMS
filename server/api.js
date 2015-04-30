var http = require('http'),
	fs    = require('fs'),
	watch = require('node-watch'),
	rootpath = process.cwd(),
	Site = require(rootpath+"/libraries/models/site"),
	Utils = require(rootpath+"/libraries/utilities"),
	port = 1801,
	cdn_port = 1802,
	urls = [],
	sites = {},
	URL = require("url-parse"),
	disregardFiles = [".DS_Store",".hide",".git",".deleteme"],
	prev = function(){}

// Dynamically build a list of sites based on the folders in /public/sites
fs.readdir(rootpath+"/public/sites",function(err,folders){
	if(err){ console.error("Could not open sites dir!",err); return;}

	folders.forEach(function(url){
		if(disregardFiles.indexOf(url) == -1){
			// generate a new Site and parse its content
			sites[url] = new Site({rootpath:rootpath+"/public/sites/",host:url,scripts:[]}).render();

			// watch folder for changes
			watch(rootpath+"/public/sites/"+url, function(filename) {
				console.log(url," had updated content.");
				sites[url].render();
			});
		}
	});
});

http.createServer(function (request, response) {
	var host = new URL(request.headers.host),
		page = null

	if(host.hostname == "localhost") GLOBAL.cdn = "http://"+host.hostname+":"+cdn_port+"/"
	else GLOBAL.cdn = "http://"+host.hostname+":"+cdn_port+"/"

	if(request.url == "/") page = "home.html"
	else page = request.url.replace(/^\//,"")

	reqpage = page.split(".")

	if(reqpage.length == 2 && reqpage[1] == "html"){

		// Show HTML
		response.writeHead(200, {
			'Content-Type': 'text/html',
			'Access-Control-Allow-Origin' : '*'
		});
		sites[host.hostname].html(reqpage[0],function(html){
			response.end(html);
		});
	}
	else{

		// send back JSON data
		response.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : '*'
		});
		response.end(JSON.stringify(sites[host.hostname].getData(reqpage[0])));
	}
}).listen(port);

console.log("Listening on port:"+port);