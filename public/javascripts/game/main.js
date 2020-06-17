/*

This is the core file of the client side where everything comes together.
This file should be kept very short as all the logic should be done in other files

*/

import Animate from '../visuals/Animate.js'
import UI from '../ui/Interface.js'
import {game} from "./Game.js";
import {camera} from "../visuals/Camera.js";

(function () {
	// Initialize classes
	var animate = new Animate();
	var ui = new UI();

	// Update loop
	function update() {
		game.update();
	}

	// Draw loop
	function draw() {
		animate.animateAll();
		ui.draw();
	}

	// Game loop
	var fps = 1000;
	var now;
	var then = Date.now();
	var interval = 1000/fps;
	window.delta = 0;
	var fpsArray = [];
	window.averageFps = 0;
	
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
	        if (fpsArray.length > 300) {
	            fpsArray.shift();
	        }
	        averageFps = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length;
	    }
	}
	
	loop();
}())