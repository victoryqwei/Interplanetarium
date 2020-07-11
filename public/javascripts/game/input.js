/*

This file gets the raw user input.

*/

import Vector from "../util/Vector.js";
import {game} from "./Game.js";
import {util} from "../util/Util.js";
export let input = {};
import {camera} from "../visuals/Camera.js";

window.username = "Player" + util.randInt(1000, 9999);

// Keyboard events
input.keys = {};
onkeydown = onkeyup = function(e){
    e = e || event;
    input.keys[e.keyCode] = e.type == 'keydown';
}

// Mouse events
input.mouse = new Vector();
$("#game-canvas").on("mousemove", function (e) {
	input.mouse.x = e.offsetX;
	input.mouse.y = e.offsetY;
})

$("#game-canvas").on('mousedown', function (e) {
	if (e.which == 1) {
		input.mouse.left = true;
	} else if (e.which == 2) {
		input.mouse.middle = true;
	} else if (e.which == 3) {
		input.mouse.right = true;
	}
	e.preventDefault();
}).on('mouseup', function (e) {
	if (e.which == 1) {
		input.mouse.left = false;
	} else if (e.which == 2) {
		input.mouse.middle = false;
	} else if (e.which == 3) {
		input.mouse.right = false;
	}
	e.preventDefault();
})

// Scroll event
var scrollSpeed = 0.01;
$(window).bind('mousewheel', function(event) {
	if (document.readyState != "complete" || game.state != "play")
		return;

	if (event.originalEvent.wheelDelta >= 0) {
        camera.zoom = Math.min(camera.zoom+delta/100, camera.maxZoom);
    } else if (event.originalEvent.wheelDelta <= 0) {
        camera.zoom = Math.max(camera.zoom-delta/100, camera.minZoom);
    }
});

/*// Leave tab event
$(window).blur(function() {
  alert("You have been disconnected from the server.");
});*/