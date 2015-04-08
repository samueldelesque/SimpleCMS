var Parser = require('./parse'),
	Model = require('./model'),
	Utils = require('./utilities'),
	fs    = require('fs'),
	jade = require('jade'),
	root_url = process.cwd()+"/",
	disregardFiles = [".DS_Store","meta.txt"]

var Site = Model.extend({
	parseFiles: function(callback){
		var s = this;
		if(!s.get("host")){console.error("No host given!");}
		var path = root_url+"public/sites/"+s.get("host")

		fs.exists(path,function(exists){
			if(!exists){
				console.error("Host not found "+path+s.get("host")+"!")
				return;
			}

			Parser.read(path,callback);
		})
		return s
	},
	render: function(){
		var s = this;
		s.parseFiles(function(err,data){
			if(err){
				console.log("Cannot solve render while an error is occuring in fetching data.");
				return;
			}

			s.set("pages",data);
		})
		s.getScripts()
		s.getStaticMenu()
		return s
	},
	getScripts: function(){
		var s = this
		fs.readdir(root_url+"public/sites/"+s.get("host")+"/js",function(err,scripts){
			if(err){return;}
			var list = []
			scripts.forEach(function(script){
				if(disregardFiles.indexOf(script) == -1){
					list.push(script)
				}
			})
			s.set("scripts",list)
		})
	},
	getStaticMenu: function(){
		var s = this,
			staticLinks = []
		fs.readFile(root_url+"public/sites/"+s.get("host")+"/menu.txt", 'utf8', function(err,data){
			if(err){return;}
			var links = data.split("\n");
			Utils.forEach(links,function(link,i){
				var linkProps = link.split("|")
				staticLinks.push({url:linkProps[1],title:linkProps[0]})
			})
			s.set("staticLinks",staticLinks)
		})
	},
	html: function(page,callback){
		var s = this
		var pageData = s.getData(page)
		var menuData = s.getMenu()
		callback(jade.renderFile(root_url+"server/templates/"+pageData.template+'.jade', {cdn:cdn+s.get("host")+"/",scripts:s.get("scripts"),page:pageData,menu:menuData}));
		return s;
	},
	getMenu: function(){
		var s = this
		var data = s.get("pages");
		var menu = {
			staticLinks: s.get("staticLinks"),
			dynamicLinks: []
		}
		Utils.forEach(data,function(page,url){
			menu.dynamicLinks.push({url:url+".html",title:page.title})
		})
		return menu
	},
	getData: function(page){
		var s = this
		var data = s.get("pages")
		if(typeof page == undefined) return data
		if(page.length == 0) page="home"
		if(!data[page]) data[page] = {template:"notfound"}
		if(!data[page].template)data[page].template = "default"
		return data[page]
	}
})

module.exports = Site;