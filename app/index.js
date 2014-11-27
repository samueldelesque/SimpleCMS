var http = require('http');
var fs    = require('fs');
var Site = require("./includes/site");

GLOBAL.cdn = "http://0.0.0.0:8080/";

var urls = ["samueldelesque.com"];

var sites = {};
fs.readdir("./sites",function(e,folders){
	if(e){
		console.error("Could not open sites dir!");
	}
	folders.forEach(function(url){
		sites[url] = new Site(url).render();
	});
});

http.createServer(function (request, response) {
	var host_parts = request.headers.host.replace(/http(s)?:\/\//g,'').split(":");
	var host = host_parts[0];
	if(!sites[host]){
		response.writeHead(404, {
			'Content-Type': 'text/html',
			'Access-Control-Allow-Origin' : '*'
		});
		response.end("Site not found ("+host+")!");
	}
	else{
		response.writeHead(200, {
			'Content-Type': 'text/html',
			'Access-Control-Allow-Origin' : '*'
		});
		sites[host_parts[0]].show(request.url.split("/"),function(html){
			response.end(html);
		});
	}
}).listen(1337);
console.log("Listening!	");