var fs    = require('fs');
var TreeParser = function(){
	this.read = function(dir,callback){
		var pages = {};
		fs.readdir(dir,function(e,folders){
			if(e){
				callback("Failed to read directory!",{});
				console.error("Failed to read directory!",e);
				return;
			}
			var ignore = [".DS_Store","css","meta.txt","js","menu.txt","_full","_thumbs"];
			var pending = folders.length;
			folders.forEach(function(el,i){
				var folderPath = dir+"/"+el;
				// Skip files in root
				if(ignore.indexOf(el) > -1 || !fs.lstatSync(folderPath).isDirectory()){
					pending--;
					return;
				}
				pages[el] = {
					title:el,
					description:null,
					content:[]
				};
				fs.readdir(folderPath,function(e,files){
					if(e){
						console.error(e)
						return callback(e)
					}
					files.forEach(function(fi,i){
						if(fi == "meta.txt"){
							pending++;
							fs.readFile(dir+"/"+el+"/"+fi, 'utf8', function(err,data){
								if(err){
									callback("Failed to read "+el+" meta data!",{});
									return;
								}
								var attributes = data.split("\n");
								attributes.forEach(function(attr){
									var parts = attr.split(":");
									if(parts.length==2)
										pages[el][parts[0].trim()] = parts[1].trim();
									else
										console.log(parts,"in",el+"/"+fi,"seems to have a problem.")
								});
								pending--;
								if(pending==0){
									callback(false,pages);
								}
							});
						}
						if(ignore.indexOf(fi) > -1)return;
						var p = fi.split(".");
						if(p.length > 1){
							var ext = p.pop();
							var t = p.join(".").split("-");
							if(t.length > 0)t.shift()
							var title = t.join("-");
							switch(ext.toLowerCase()){
								case "jpg":
								case "jpeg":
								case "png":
								case "gif":
									pages[el].content.push({title:title,type:"img",path:el+"/"+fi,thumb:el+"/_thumbs/"+fi,full:el+"/_full/"+fi});
								break;

								case "txt":
									fs.readFile(dir+"/"+el+"/"+fi, 'utf8', function(err,data){
										if(!err){
											pages[el].content.push({title:title,type:"txt",text:data.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2')});
										}
									})
								break;

								default:
									console.log(fi+" was not a recognized filetype.");
								break;
							}
						}
						else{
							console.log(fi+" was not a recognized filetype.");
						}
					});
					pending--;
					if(pending==0){
						callback(false,pages);
					}
				});
			});
		});
	}
}

module.exports = new TreeParser();