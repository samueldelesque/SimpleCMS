var fs    = require('fs');
var jade = require('jade');
var http = require('http');

var base = "./content";
var cdn = "http://0.0.0.0:8080/";

var pages = {};
fs.readdir(base,function(e,folders){
	if(e){
		console.error("Failed to read directory!",e);
		return;
	}
	var ignore = [".DS_Store","css"];
	folders.forEach(function(el,i){
		if(ignore.indexOf(el) > -1)return;
		pages[el] = {title:el,files:[]};
		fs.readdir(base+"/"+el,function(e,files){
			files.forEach(function(fi,i){
				if(ignore.indexOf(fi) > -1)return;
				pages[el].files.push(el+"/"+fi);
			});
		});
	});

});


setTimeout(function(){
	pages.cdn = cdn;
	var html = jade.renderFile('./templates/plain.jade', {cdn:cdn,page:pages.home});

	http.createServer(function (request, response) {
	    response.writeHead(200, {
	        'Content-Type': 'text/html',
	        'Access-Control-Allow-Origin' : '*'
	    });
	    response.end(html);
	}).listen(1337);
}, 200);