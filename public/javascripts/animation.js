
// Create global animation variable
var animation = {
	animateSpawn: false,
	spawnAnimationProperties: undefined
}

function animationLoop() {

	// Loop if animation has begun
	if(animation.animateSpawn) {
		animateSpawnLoop();
	}
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