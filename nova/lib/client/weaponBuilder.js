
//var Promise = require("bluebird");
var projectileWeapon = require("../server/projectileWeaponServer.js");
var turretWeapon = require("../server/turretWeaponServer.js");
var beamWeapon = require("../server/beamWeaponServer.js");
var beamTurret = require("./beamTurret.js");
var frontQuadrantTurretWeapon = require("../server/frontQuadrantTurretWeaponServer.js");
var pointDefenseWeapon = require("./pointDefenseWeapon.js");
var pointDefenseBeam = require("../server/pointDefenseBeamServer.js");
var inSystem = require("./inSystem.js");
var loadsResources = require("./loadsResources.js");
var errors = require("../client/errors.js");
var UnsupportedWeaponTypeError = errors.UnsupportedWeaponTypeError;


var weaponBuilder = class extends loadsResources(inSystem) {
    constructor(buildInfo, source) {
	super(...arguments);
	this.buildInfo = Object.assign({}, buildInfo); // so sub recursion works
	this.source = source;
	if (typeof(buildInfo) !== 'undefined') {
	    this.id = this.buildInfo.id;
	    this.count = buildInfo.count || 1;
	    this.buildInfo.count = this.count;
	}
	this.type = "Weapon";
    }

    async _build() {
	var meta = await this.loadResources(this.type, this.buildInfo.id);
	this.meta = Object.assign({}, meta);
	// copy the subs
	if (this.meta.submunitions) {
	    this.meta.submunitions = this.meta.submunitions.map(function(s) {
		return Object.assign({}, s);
	    });
	}
    }
    
    _setWeaponType() {

	if (['bay'].includes(this.meta.guidance)) {
	    // temporary
	    throw new UnsupportedWeaponTypeError(this.meta.guidance);
	}

	switch (this.meta.guidance) {
	case 'unguided':
	    this.weapon = new projectileWeapon(this.buildInfo, this.source);
	    break;
	case 'guided':
	    this.weapon = new projectileWeapon(this.buildInfo, this.source);
	    break;
	case 'turret':
	    this.weapon = new turretWeapon(this.buildInfo, this.source);
	    break;
	case 'beam':
	    this.weapon = new beamWeapon(this.buildInfo, this.source);
	    break;
	case 'beamTurret':
	    this.weapon = new beamTurret(this.buildInfo, this.source);
	    break;
	case 'pointDefense':
	    this.weapon = new pointDefenseWeapon(this.buildInfo, this.source);
	    break;
	case 'pointDefenseBeam':
	    this.weapon = new pointDefenseBeam(this.buildInfo, this.source);
	    break;
	case 'frontQuadrant':
	    this.weapon = new frontQuadrantTurretWeapon(this.buildInfo, this.source);
	    break;
	default:
	    this.weapon = new projectileWeapon(this.buildInfo, this.source);
	    break;
	}

    }

    async buildSub(subData) {
	await this._build();

	// Fix me if you implement multiple submunitions
	this.meta.submunitions.forEach(function(s) {
	    s.limit = subData.limit;
	});


	
	this.buildInfo.meta = this.meta; // only okay since buildInfo was copied
	this._setWeaponType();


	// no beam support yet
	// replace some functions of weapon
	this.weapon.getProjectileCount = function() {
	    return subData.count;
	};

	var fire = this.weapon.fire;
	this.weapon.fire = function(direction, position, velocity) {

	    for (var i = 0; i < subData.count; i++) {
		var offset = (Math.random() - 0.5) * 2 * subData.theta * 2*Math.PI / 360;
		direction = this.source.pointing + offset;
		position = position || this.source.position;
		velocity = velocity || this.source.velocity;
		this.target = this.source.target;
		this.fireProjectile(direction, position, velocity);
	    }
	    return true;

	}.bind(this.weapon);

	await this.weapon.build();
	return this.weapon;
    }
    
    async buildWeapon() {
	await this._build();

	this._setWeaponType();


	await this.weapon.build();
	return this.weapon;
    }
};


module.exports = weaponBuilder;

