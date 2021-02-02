
var beamWeapon = require("../server/beamWeaponServer.js");


beamTurret = class extends beamWeapon {
    constructor() {
	super(...arguments);
	this._fireFunc = null;
	this._stopFunc = null;
    }

    getFireVector(position) {
	// needed since this is the vector of the beam, not the destination point
	var start = this.getFirePosition(); 
	var end = this.target.position;
	
	return start.delta(end);
    }
    
    startFiring(notify = true) {

	var stop = super.stopFiring.bind(this, notify);
	this._stopFunc = function() {
	    // If we stopped firing, then we need
	    // to start again if something is targeted
	    this.onceState("hasTarget", this._fireFunc, true);
	    stop();
	}.bind(this);


	var fire = super.startFiring.bind(this, notify);
	this._fireFunc = function() {
	    // If we started firing, then we need
	    // to stop again if there is no target
	    this.onceState("hasTarget", this._stopFunc, false);	    
	    fire();
	}.bind(this);

	this.onceState("hasTarget", this._fireFunc, true);

    }

    stopFiring(notify = true) {
	this.offState("hasTarget", this._fireFunc, true);
	this.offState("hasTarget", this._stopFunc, false);
	super.stopFiring(notify);
    }

    render() {
	super.render();
    }
    
};

module.exports = beamTurret;

