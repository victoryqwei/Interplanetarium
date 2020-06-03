/*

This file gets the raw user input.

*/

import Vector from "../util/Vector.js";

export let input = {};

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
	if (document.readyState != "complete" || display.state != "play")
		return;

	if (event.originalEvent.wheelDelta >= 0) {
        display.zoom = Math.min(display.zoom+delta/100, display.maxZoom);
    } else if (event.originalEvent.wheelDelta <= 0) {
        display.zoom = Math.max(display.zoom-delta/100, display.minZoom);
    }
});