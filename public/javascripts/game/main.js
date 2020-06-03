/*

This is the core file of the client side where everything comes together.
This file should be kept very short as all the logic should be done in other files

*/

import Animate from './Animate.js'
import UI from '../ui/Interface.js'
import {game} from "./Game.js";

(function () {

	// Instantiate the canvas
	window.canvas = document.getElementById("game-canvas");
	window.ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	$(window).resize(function () {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	})

	// Initialize classes
	var animate = new Animate();
	var ui = new UI();

	// Setup
	function setup() {

		// Set display setting
		window.display = {
			zoom: 0.6,
			maxZoom: 3,
			minZoom: 0.6,
			mapZ: 0.00001,
			warp: false
		}
		display.state = "menu"; // "menu", "play", "settings", "starmap"
	}

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

	setup();
	loop();
}())