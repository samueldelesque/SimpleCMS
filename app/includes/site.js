var parser = require('./parse');
var fs    = require('fs');
var jade = require('jade');

var Site = function(host){
	this.data={
		host: null,
		pages: {},
	};
	this.set = function(n,v){
		this.data[n] = v;
	}
	this.get = function(n){
		if(typeof this.data[n] == undefined)return false;
		return this.data[n];
	}

	this.set("host",host);

	this.getData = function(callback){
		var s = this;
		if(!s.get("host")){console.error("No host given!");}
		var path = "./sites/"+s.get("host");
		fs.exists(path,function(exists){
			if(!exists){
				console.error("Host not found "+s.get("host")+"!");
				return;
			}

			parser.read(path,function(err,data){
				if(err){console.error(err);}
				callback(data);
			});
		});
		return s;
	}
	this.render = function(){
		var s = this;
		s.getData(function(data){
			s.set("pages",data);
		});
		return s;
	}
	this.show = function(url,callback){
		var s = this;
		var page = url[1];
		if(page == "render"){s.render();callback("Page rendered!");return;}
		if(page.length == 0)page="home";
		var data = s.get("pages");
		if(!data[page])data[page] = {template:"notfound"}
		if(!data[page].template)data[page].template = "default";
		callback(jade.renderFile('./templates/'+data[page].template+'.jade', {cdn:cdn+s.get("host")+"/",page:data[page]}));
		return s;
	}
	return this;
}

module.exports = Site;