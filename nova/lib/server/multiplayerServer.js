
var multiplayer = require("../client/multiplayer.js");

var multiplayerServer = class extends multiplayer {
    constructor() {
	super(...arguments);

	this.broadcaster = function(toEmit) {
	    if (toEmit.rebroadcast) {
		this.socket.broadcast.emit(this.UUID + "event", toEmit);
	    }
	}.bind(this);
	this.socket.on(this.UUID + "event", this.broadcaster);

	
	if ("broadcast" in this.socket) {
	    // Super hacky! Terrible!
	    // If it doesn't have property "broadcast" then it's the server's io instance
	    this._broadcastFunction = function() {
		this.socket.broadcast.emit(...arguments);
	    };
	}
	else {
	    this._broadcastFunction = function() {
		this.socket.emit(...arguments);
	    };
	}



	// This contains all the instances of multiplayerServer
	this.globalSet.add(this);
	
    }
    _bindQueryListener() {}

    _send(eventName, eventData, sendFunction) {

	var toEmit = {};
	toEmit.name = eventName;
	toEmit.data = eventData;
	sendFunction(this.UUID + "event", toEmit);
    }
    
    emit(eventName, eventData) {
	// broadcast to all the clients except this one
	this._send(eventName, eventData, this._broadcastFunction.bind(this));
	//this._send(eventName, eventData, this.socket.broadcast.emit.bind(this.socket));
    }
    respond(eventName, eventData) {
    	// send to this client
    	this._send(eventName, eventData, this.socket.emit.bind(this.socket));
    }

    broadcast(eventName, eventData) {
    	// send to this client and all the others
    	// could use io.broadcast instead
    	this.emit(eventName, eventData);
    	this.respond(eventName, eventData);
    }

    _destroy() {
	super._destroy();
	this.globalSet.delete(this);
    }
    

};



// This is rather disgusting:
multiplayerServer.prototype.globalSet = new Set();

multiplayerServer.prototype.bindSocket = function(socket) {
    // This must be called once with the socket instance.
    // It handles communication between all instances of multiplayerServer
    // It is gross and terrible
    // It would be better if socket had a way of listening for events regardless of client.
    

    // If multiplayerObject doesn't get destroyed, these start piling up and sending bunches
    // of extra responses. Make sure to destroy multiplayerObject when it's no longer needed!

    socket.on("query", function(message) {
	this.globalSet.forEach(function(instance) {
	    instance.queryListener(message, socket);
	});
    }.bind(this));
    
    socket.on("response", function(message) {
	this.globalSet.forEach(function(instance) {
	    instance.responseListener(message);
	});
    }.bind(this));
    
};


module.exports = multiplayerServer;
