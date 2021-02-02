/*
damageable.js
Anything that can be damaged
mixin
*/


var collidable = require("../server/collidableServer.js");
//var Promise = require("bluebird");
var errors = require("./errors.js");
var AlliesError = errors.AlliesError;


damageable = (superclass) => class extends superclass {

    constructor() {
	super(...arguments);
	if (! ("allies" in this)) {
	    this.allies = new Set([this]); // a set of things not to cause harm to.
	}

	if (typeof(buildInfo) !== 'undefined') {
	    this.buildInfo.type = "damageable";
	}
	this.dying = false;
	this.setState("zeroArmor", false);
	this._onDeathBound = this.onDeath.bind(this);
	this.onState("zeroArmor", this._onDeathBound); // Ship removes this
    }

    setProperties() {
	super.setProperties.call(this);
	this.shield = this.properties.physics.shield;
	this.armor = this.properties.physics.armor;
    }

    _receiveCollision(other) {
	if (other.passThroughShields) {
	    this.armor -= other.armorDamage;
	}
	else {
	    this.shield -= other.shieldDamage;
	    var minShield = -this.properties.physics.shield * 0.05;
	    if (this.shield < 0) {
		if (this.shield < minShield) {
		    this.shield = minShield;
		}
		this.armor -= other.armorDamage;
	    }
	}

	if (this.armor <= 0) {
	    this.armor = 0;
	    //this.velocity = [0,0];
	    //this.onDeath(); // make this an event
	    this.setState("zeroArmor", true);
	}
	super._receiveCollision(other);
    }

    updateStats(stats) {
	super.updateStats.call(this, stats);
	if (typeof(stats.shield) !== 'undefined') {
	    this.shield = stats.shield;
	}
	
	if (typeof(stats.armor) !== 'undefined') {
	    this.armor = stats.armor;
	}

	if (typeof(stats.dying) !== 'undefined') {
	    if (!this.dying & stats.dying) {
		this.onDeath();
	    }
	}
    }

    getStats() {
	var stats = super.getStats.call(this);
	stats.shield = this.shield;
	stats.armor = this.armor;
	stats.dying = this.dying;
	return stats;
    }

    render(delta) {

	// Nova shield and armor regen: 1000 pts of regen equals
	// 30 points of shield or armor per second
	this.shield += this.properties.physics.shieldRecharge * delta / 1000;
	this.armor += this.properties.physics.armorRecharge * delta / 1000;
	
	if (this.shield > this.properties.physics.shield) {
	    this.shield = this.properties.physics.shield;
	}
	
	if (this.armor > this.properties.physics.armor) {
	    this.armor = this.properties.physics.armor;
	}
	
	super.render(...arguments);
    }


    async _onDeath() {
	this.dying = false; // it died.
    }

    async onDeath() {
	if (!this.dying) {
	    this.dying = true;
	    await this._onDeath();
	}
    }

};

module.exports = damageable;
