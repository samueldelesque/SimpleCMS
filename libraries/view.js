var Model = require("./model"),
	modelNoop = Model.extend({}),
	templateNoop = "Template not found"

function View(param) {
	this.init(param)
}
View.prototype.init = function(param){
	if(!param.model) param.model = new modelNoop({})
	if(!param.template) param.template = templateNoop

	this.model = param.model
	this.template = param.template
}
View.prototype.html = function(){
	return this.render(this.template,this.model.get())
}
View.prototype.render = function(template,data){
	return template
}
View.extend = function(props) {
	var child = function(data){this.data = data || {}}
	child.prototype = View.prototype
	child.constructor = View.prototype.init
	for (var property in props){
		if(props.hasOwnProperty(property))
		child.prototype[property] = props[property]
	}
	return child
}

module.exports = View;