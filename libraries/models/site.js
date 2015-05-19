var Parser = require('../parse'),
	Model = require('../model'),
	Utils = require('../utilities'),
	fs    = require('fs'),
	jade = require('jade'),
	root_url = process.cwd()+"/",
	disregardFiles = [".DS_Store","meta.txt","_full","_thumbs"]

var Site = Model.extend({
	parseFiles: function(callback){
		var s = this;
		if(!s.get("host")){console.error("No host given!");}
		var path = this.get("rootpath")+s.get("host")

		fs.exists(path,function(exists){
			if(!exists){
				console.error("Host not found "+path+"!")
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

			s.set("pages",data)
		})
		s.getScripts()
		s.getStaticMenu()
		s.getFooter()
		return s
	},
	getScripts: function(){
		var s = this
		fs.readdir(this.get("rootpath")+s.get("host")+"/js",function(err,scripts){
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
		fs.readFile(this.get("rootpath")+s.get("host")+"/menu.txt", 'utf8', function(err,data){
			if(err){return;}
			var links = data.split("\n");
			Utils.forEach(links,function(link,i){
				var linkProps = link.split("|")
				staticLinks.push({url:linkProps[1],title:linkProps[0]})
			})
			s.set("staticLinks",staticLinks)
		})
	},
	getFooter: function(){
		var s = this
		fs.readFile(this.get("rootpath")+s.get("host")+"/footer.txt", 'utf8', function(err,data){
			if(err){return;}
			s.set("footer",data.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'))
		})
	},
	html: function(page,callback){
		var s = this
		var pageData = s.getData(page)
		var menuData = s.getMenu()
		callback(jade.renderFile(root_url+"server/templates/"+pageData.template+'.jade', {cdn:GLOBAL.cdn,scripts:s.get("scripts"),page:pageData,menu:menuData,footer:s.get("footer")}));
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
			menu.dynamicLinks.push({url:url+".html",title:page.title||"",menu:page.menu||page.title||""})
		})
		return menu
	},
	getData: function(page){
		var s = this
		var data = s.get("pages")
		if(!data){console.log("Failed to load pages",s.get("pages"));return {}}
		if(typeof page == undefined) return data
		if(page.length == 0) page="home"
		if(!data[page]) data[page] = {template:"notfound"}
		if(!data[page].template)data[page].template = "default"
		return data[page]
	}
})

module.exports = Site;