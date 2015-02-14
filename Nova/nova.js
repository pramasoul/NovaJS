// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x000000)

// create a renderer instance
var screenW = $(window).width(), screenH = $(window).height() - 10
//var screenW = 800, screenH = 600;
var renderer = PIXI.autoDetectRenderer(screenW, screenH)
$(window).resize(onResize)
// add the renderer view element to the DOM
document.body.appendChild(renderer.view)



function stagePosition(x, y) { //where x and y are absolute positions in the universe
//    stageX = 



}


	


function ship(shipName) {
    inertial.call(this, shipName)
    this.url = 'objects/ships/'
    this.pointing = 0
}

ship.prototype = new inertial


function playerShip(shipName) {
    ship.call(this, shipName)
    this.pointing = Math.random()*2*Math.PI
    this.xvelocity = 0
    this.yvelocity = 0
    this.isPlayerShip = true
}

playerShip.prototype = new ship

playerShip.prototype.onAssetsLoaded = function() {
    if (object.prototype.onAssetsLoaded.call(this)) {
	console.log("and it's mine")
    }
}

playerShip.prototype.updateStats = function() {
    var keys = KeyboardJS.activeKeys()
    var turning
    var accelerating
    if (_.contains(keys, 'right') && !_.contains(keys, 'left')) {
	turning = 'right'
    }
    else if (_.contains(keys, 'left') && !_.contains(keys, 'right')) {
	turning = 'left'
    }
    else {
	turning = ''
    }
    if (_.contains(keys, 'down')) {
	turning = 'back'
    }
    if (_.contains(keys, 'up')) {
	accelerating = true
    }
    else {
	accelerating = false
    }
    

    inertial.prototype.updateStats.call(this, turning, accelerating)

}



var ships = []
var myShip = new playerShip("Starbridge A")
var randomShip = new ship("Starbridge A")

ships[0] = myShip
ships[1] = randomShip
ships[0].build()
ships[1].build()

var startGameTimer = setInterval(function () {startGame()}, 1000);


/*
Starts the game if everything is ready to render.
*/
function startGame() {
    var readyToRender = true;
    for (var i = 0; i < ships.length; i++) {
	if (!ships[i].renderReady) {
	    readyToRender = false;
	}
    }
    if (readyToRender) {
	requestAnimFrame(animate)
	clearInterval(startGameTimer)
	console.log("Rendering started")
    }
}

//requestAnimFrame(animate)

function animate() {
    requestAnimFrame( animate )
    object.prototype.time = new Date().getTime()
    ships[1].sprite.position.x = 100
    ships[1].sprite.position.y = 100
    ships[1].updateStats('right', false)
    myShip.updateStats()

//    for (var i = 0; i < ships.length; i++) {
//	ships[i].updateStats(turning, accelerating)
//    }


    line.clear()
    line.lineStyle(5, 0xFF0000, 1)
    line.moveTo(myShip.sprite.position.x, myShip.sprite.position.y)
    line.lineTo(myShip.xvelocity + myShip.sprite.position.x, -myShip.yvelocity + myShip.sprite.position.y)

    //line.lineTo(300,300)
    renderer.render(stage)
}

var line = new PIXI.Graphics()
stage.addChild(line)


function onResize() {
    screenW = $(window).width();
    screenH = $(window).height();
    renderer.resize(screenW,screenH);
}





