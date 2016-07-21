module.exports = spaceObjectServer;
var spaceObject = require("../client/spaceObject.js");
var Promise = require("bluebird");

function spaceObjectServer(name, system) {
    spaceObject.call(this, name, system);

}

spaceObjectServer.prototype = new spaceObject;


spaceObjectServer.prototype.loadResources = function() {
    return new Promise(function(fulfill, reject) {
	var url = "../"+this.url + this.name + '.json';
	this.meta = require(url);

	if ((typeof(this.meta) !== 'undefined') && (this.meta !== null)) {
	    //console.log('fulfilling');
	    fulfill();
	    
	}
	else {
	    reject();
	}

	
    }.bind(this));
}

spaceObjectServer.prototype.makeSize = function() {
    // fix me later
    this.size[0] = 72;
    this.size[1] = 72;
}

spaceObjectServer.prototype.addSpritesToContainer = function() {
    // do nothing
}
spaceObjectServer.prototype.makeSprites = function() {
}

spaceObjectServer.prototype.callSprites = function(call) {
    // also do nothing
}
    
spaceObjectServer.prototype.render = function() {
    // again, do nothing

}

spaceObjectServer.prototype.destroy = function() {
    var index = this.system.spaceObjects.indexOf(this);
    this.system.spaceObjects.splice(index, 1);

}

    