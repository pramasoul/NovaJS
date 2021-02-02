var sprite = require("../server/spriteServer.js");
var PIXI = require("../server/pixistub.js");
var _ = require("underscore");
//Promise = require("bluebird");
var inSystem = require("./inSystem.js");
var loadsResources = require("./loadsResources.js");
var multiplayer = require("../server/multiplayerServer.js");
var exitPoint = require("./exitPoint.js");
var renderable = require("./renderable.js");
var visible = require("./visible.js");
var targetable = require("./targetable.js");
var destroyable = require("./destroyable.js");
var position = require("./position.js");
var buildable = require("./buildable.js");
var placeable = require("../server/placeableServer.js");

var spaceObject = class extends placeable(destroyable(targetable(loadsResources(renderable(visible(buildable(inSystem))))))) {

    constructor(buildInfo, system, socket) {
	// Socket must be known at build time so setMultiplayer works
	super(...arguments);
	this.socket = socket || this.socket;
	this.buildInfo = buildInfo;
	this.renderReady = false;
	this.type = 'misc';
	//this.url = 'objects/misc/';
	this.position = new position(0, 0);
	//this.position = [0,0];
	// planets can have weapons
	// this also means projectiles can have weapons :P
	this.weapons = {};
	this.weapons.all = [];
	
	this.sprites = {};

	this.size = [];

	
	if (typeof(buildInfo) !== 'undefined') {
	    this.name = buildInfo.name;
	    if (this.buildInfo.hasOwnProperty('position')) {
		this.position[0] = this.buildInfo.position[0];
		this.position[1] = this.buildInfo.position[1];
	    }
	    
	    if (typeof this.buildInfo.UUID !== 'undefined') {
		this.buildInfo.multiplayer = true;
		this.UUID = this.buildInfo.UUID;
		this.setMultiplayer();
	    }
	    
	//     if (this.buildInfo.multiplayer) {
	// 	this.system.multiplayer[this.buildInfo.UUID] = this;
	//     }
	}
	// if (typeof(system) !== 'undefined') {
	//     this.system.spaceObjects.add(this);
	// }

	this.exitPoints = {};
	this.exitPoints.center = [new exitPoint(this)];
	this.system = system; // a function call (see inSystem.js)
    }
    setMultiplayer() {
	// this is due to projectile.js
	// refactor is needed: Multiplayer -> mixin
	// SpaceObject -> default not multiplayer
	// used for multiplayer communication
	this.multiplayer = new multiplayer(this.socket, this.UUID);
    }


    setListeners() {
	this.multiplayer.on('updateStats', function(newStats) {
	    this.updateStats(newStats);
	}.bind(this));
    }
    
    get UUIDS() {
	var uuids = [];
	if (this.UUID) {
	    uuids.push(this.UUID);
	}
	return uuids;
    }

    async _loadMeta() {
	this.meta = await this.loadResources(this.type, this.buildInfo.id);
    }
    
    async _build() {
	await this._loadMeta();
	this.name = this.meta.name; // purely cosmetic
    	//await this.setProperties();
	await this.setProperties();
	await this.makeSprites();
	this.makeSize();
	
	this.addSpritesToContainer();
	this.addToSpaceObjects();
	if (this.multiplayer) {
	    this.setListeners();
	}
	this.renderReady = true;
	await super._build();
    }

    setVisible(v) {
    	super.setVisible(v);
    }
    
    hide() {
	// Can't shoot if hidden
	if (! this._destroying) {
	    this.weapons.all.forEach(function(w) {
		w.enabled = false;
		w.firing = false;
	    });
	}
	super.hide();
    }

    show() {
	this.weapons.all.forEach(function(w) {
	    w.enabled = true;
	});
	super.show();
    }
    

    sendStats() {
//	var newStats = {};
	//newStats[this.UUID] = this.getStats();
	this.multiplayer.emit("updateStats", this.getStats());
	//this.socket.emit('updateStats', newStats);
    }
    
    addToSpaceObjects() {
	this.system.built.spaceObjects.add(this);
	if (this.buildInfo.multiplayer) {
	    this.system.built.multiplayer[this.buildInfo.UUID] = this;
	}
    }

    makeSprites() {

	var images = this.meta.animation.images;
	var promises = Object.keys(images).map(async function(imageName) {
	    var spriteSheetID = images[imageName].id;

	    // see planetServer.js for the reason I can't change this yet. (it's a stupid one)
	    //var spriteSheet = await this.novaData.spriteSheets.get(imageID);
	    //var spriteSheet = await this.loadResources("spriteSheets", imageID);
	    
	    this.sprites[imageName] = new sprite(spriteSheetID);
	    await this.sprites[imageName].build();

	}.bind(this));

	return Promise.all(promises);
    }



    makeSize() {
	// used for targetCorners
	var textures = _.map(this.sprites, function(s) {return s.textures;});
	
	this.size[0] = Math.max.apply(null, _.map(textures, function(textureList) {
	    return Math.max.apply(null, _.map(textureList, function(texture) {return texture.width}));
	}));
	
	this.size[1] = Math.max.apply(null, _.map(textures, function(textureList) {
	    return Math.max.apply(null, _.map(textureList, function(texture) {return texture.height}));
	}));
    }


    addSpritesToContainer() {
	_.each(this.sprites, function(s) {
	    this.container.addChild(s.sprite);
	}.bind(this));
	
	//this.hide();

	// Didn't I rewrite the add to system code? Maybe this is unneeded
	//this.system.container.addChild(this.container);
    }

    callSprites(toCall) {
	return _.map(_.map(_.values(this.sprites), function(x) {return x.sprite;}), toCall, this);
    }

    renderSprite(spr, rotation, imageIndex) {
	spr.sprite.rotation = rotation;
	spr.sprite.texture = spr.textures[imageIndex];
    }


    updateStats(stats) {
	if (typeof(stats.position) !== 'undefined') {
	    this.position[0] = stats.position[0];
	    this.position[1] = stats.position[1];
	}
	if (typeof(stats.visible) !== 'undefined') {
	    if (this.built && stats.visible && !this.getVisible()) {
		this.show();
	    }
	    else if (this.built && !stats.visible && this.getVisible()) {
		this.hide();
	    }
	}
	if (typeof(stats.lastTime) !== 'undefined') {
	    this.lastTime = stats.lastTime;
	}
	
    }

    getStats() {
	var stats = {};
	stats.position = [this.position[0], this.position[1]];
	stats.visible = this.getVisible();
	//    stats.lastTime = this.lastTime;
	//    stats.target = this.target;
	return stats;
    }

    _removeFromSystem() {
	this.hide();
	this._removeFromContainer();
	
        this.system.built.spaceObjects.delete(this);

        this.system.spaceObjects.delete(this);
	super._removeFromSystem();
    }

    _addToSystem() {
	this._addToContainer();
        if (this.UUID && this.built) {
	    this.system.built.multiplayer[this.UUID] = this;
        }

        if (this.built) {
            this.system.built.spaceObjects.add(this);
        }

        this.system.spaceObjects.add(this);
	super._addToSystem();
    }

    findNearest(items) {
	
	var distances = {};
	items.forEach(function(t) {
	    var dist = this.position.distanceSquared(t.position);
	    distances[dist] = t;
	}.bind(this));
	
	var min = Math.min(...Object.keys(distances));
	if (min !== Infinity) {
	    return distances[min];
	}
	else {
	    return null;
	}
    }

    
    // destroys the object. This is NOT the function to call
    // if you want it to explode.
    _destroy() {
	this.weapons.all.forEach(function(o) {
	    if (! o.destroyed) {
		o.destroy();
	    }
	});
		
	if (this.multiplayer) {
	    this.multiplayer.destroy();
	}
	
        this.container.destroy();
        _.each(this.sprites, function(s) {s.destroy();});

	super._destroy();
    }

    _randomCirclePoint(rad) {
	// Rejection Sampling is faster in practice (I think)
	// see https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
	var point = [];
	while (point.length == 0 | (point[0]**2 + point[1]**2 > rad**2)) {
	    point[0] = Math.random()*2*rad - rad;
	    point[1] = Math.random()*2*rad - rad;
	}
	return point;
    }

    sleep(ms) {
	// cheapo hacky async sleep function
	return new Promise(function(fulfill, reject) {
	    setTimeout(fulfill, ms);
	});
    }


};

spaceObject.prototype.factor = 3/10; // the factor for nova object movement. Seems to be 3/10

module.exports = spaceObject;

