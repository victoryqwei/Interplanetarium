
// Create global animation variable
var animation = {
	animateSpawn: false,
	spawnAnimationProperties: undefined,
	animateBorder: true,
	outerBorderRadius: 0,
	outerBorderAlpha: 1,
	innerBorderRadius: 0,
	innerBorderAlpha: -0.35
}

function animationLoop() {

	// Loop if animation has begun
	if(animation.animateSpawn) {
		animateSpawnLoop();
	}

	// Animate spectating movement
	animateSpectating();

	// Animate border pulse
	if(server.map) {
		animation.animateBorder = getDistance(0, 0, rocket.pos.x, rocket.pos.y) > server.map.mapRadius - canvas.width/display.zoom;
	}
	if(animation.animateBorder && !display.performanceMode) {
		animateBorder()
	}

}

function animateBorder() {


	let mapRadius;
	if (server.map && server.map.mapRadius) {
		mapRadius = server.map.mapRadius;
	} else {
		mapRadius = 10000;
	}

	var screenPos = getScreenPos(new Vector(), display.zoom);

	// Outer border
	if(animation.outerBorderAlpha >= -0.5) {
		animation.outerBorderRadius += 0.1*delta;
		animation.outerBorderAlpha -= 0.0005*delta;
	}
	if(animation.outerBorderAlpha <= -0.5) {
		animation.outerBorderRadius = 0;
		animation.outerBorderAlpha = 1;
	}

	// Inner border
	if(animation.innerBorderAlpha >= -0.5) {
		animation.innerBorderRadius += 0.05*delta;
		animation.innerBorderAlpha -= 0.0005*delta;
	} 
	if(animation.innerBorderAlpha <= -0.5) {
		animation.innerBorderRadius = 0;
		animation.innerBorderAlpha = 1;
	}

	let options = {
		fill: false,
		outline: true,
		outlineWidth: 10*display.zoom, 
		outlineColor: "white",
		alpha: 1
	}

	drawCircle(screenPos.x, screenPos.y, mapRadius*display.zoom, "white", options);
	options.alpha = Math.max(animation.outerBorderAlpha, 0.0001);
	drawCircle(screenPos.x, screenPos.y, (mapRadius+animation.outerBorderRadius)*display.zoom, "white", options);
	options.alpha = Math.max(animation.innerBorderAlpha, 0.0001);
	drawCircle(screenPos.x, screenPos.y, (mapRadius+animation.innerBorderRadius)*display.zoom, "white", options);
}


function animateSpawn(x, y, r) {

	// Set animation properties
	animation.spawnAnimationProperties = {
		x: x,
		y, y,
		implodeSize: r,
		explodeSize: 0,
		explodeAlpha: 1
	};

	// Start animation
	animation.animateSpawn = true;
}

// Animation loop
function animateSpawnLoop() {

	if(animation.spawnAnimationProperties.implodeSize > 0) {
		let options = {
			alpha: 0.3
		}
		 drawCircle(animation.spawnAnimationProperties.x*display.zoom - rocket.pos.x*display.zoom + canvas.width/2, animation.spawnAnimationProperties.y*display.zoom - rocket.pos.y*display.zoom + canvas.height/2, animation.spawnAnimationProperties.implodeSize*display.zoom, "white", options);
		 animation.spawnAnimationProperties.implodeSize -= 0.05*delta;
	} else {
		rocket.showRocket = true;
		display.toggleMenu = false;
		display.toggleInterface = true;
		let options = {
			fill: false,
			outline: true,
			outlineWidth: 5, 
			outlineColor: "white",
			alpha: animation.spawnAnimationProperties.explodeAlpha
		}
		drawCircle(animation.spawnAnimationProperties.x*display.zoom - rocket.pos.x*display.zoom + canvas.width/2, animation.spawnAnimationProperties.y*display.zoom - rocket.pos.y*display.zoom + canvas.height/2, animation.spawnAnimationProperties.explodeSize*display.zoom, "white", options);
		animation.spawnAnimationProperties.explodeSize += 1*delta;
		animation.spawnAnimationProperties.explodeAlpha -= 0.02;
	}

	if(animation.spawnAnimationProperties.implodeSize <= 0 && animation.spawnAnimationProperties.explodeAlpha <= 0) {
		animation.animateSpawn = false;
	}

}

let randPos = new Vector();

function animateSpectating() {

	if(display.spectate) {

		if(Math.round(rocket.pos.x, 0) == Math.round(randPos.x, 0) && Math.round(rocket.pos.y, 0) == Math.round(randPos.y, 0)) {

		randPos = Vector.rotate(new Vector(1, 0), random(2*Math.PI, 0));
	    randPos.mult(random(2000, 0));

		}

		let dx = randPos.x - rocket.pos.x;
		let dy = randPos.y - rocket.pos.y;
		let angle = Math.atan2(dy, dx)

		rocket.pos.x += 1 * Math.cos(angle);
		rocket.pos.y += 1 * Math.sin(angle);

	} else {
		display.triggerSpectate = false;
		//clearInterval(moveCamera);
	}
	
}