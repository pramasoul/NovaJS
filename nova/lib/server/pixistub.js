
PIXI = {
    Container: function() {
	this.addChild = function(){};
	this.removeChild = function(){};
	this.children = [];
	this.addChildAt = function() {};
	this.destroy = function() {};
    },
    Texture: {
	fromFrame: function() {}
    },
    Sprite: function() {
	this.anchor = {'x':0, 'y':0};

	this.destroy = function() {};
    },
    DisplayGroup: function() {},
    Graphics: function() {
	this.visible = false;
	this.clear = function() {};
    }


}
    
module.exports = PIXI;
