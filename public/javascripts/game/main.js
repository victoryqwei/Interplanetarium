/*

This is the core file of the client side where everything comes together.
This file should be kept very short as all the logic should be done in other files

*/

(function () {
	// Instantiate the canvas
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	// Setup
	function setup() {

	}

	// Update loop
	function update() {

	}

	function draw() {

	}

	// Game loop

	var fps = 1000;
	var now;
	var then = Date.now();
	var interval = 1000/fps;
	var delta;
	var fpsArray = [];
	var averageFps;

	function loop() {
	    requestAnimationFrame(loop);

	    now = Date.now();
	    delta = now - then;

	    if (delta > interval) {
	        then = now - (delta % interval);

	        ctx.clearRect(0, 0, canvas.width, canvas.height);
	        update();
	        draw();

	    	// Get average frames per second with a 30 frame buffer
	        fpsArray.push(1000/delta);
	        if (fpsArray.length > 30) {
	            fpsArray.shift();
	        }
	    }
	}

	setup();
	loop();
}())