/*
	
Draw the Effects

*/

import Util from "../util/Util.js";
import {game} from "../game/Game.js";

export default class Effect {
	constructor(pos, type, options) {

		// Util
		this.util = new Util(ctx);

		// Define
		this.pos = pos;
		this.type = type;
		this.time = Date.now();
		this.finished = false;

		// Variables
		this.alpha = options.alpha || 1;
		this.duration = options.duration || 1000;
		this.size = options.size || 100;
		this.color = options.color || "white";
	}

	animate() {	

		// Switch
		switch (this.type) {
			case "explosion":
				this.animateExplosion();
			break;

			default:
				
		}
	}

	animateExplosion() {

		// Animate the explosion
		let {util} = this;
		let zoom = display.zoom;
		
		let screenPos = getScreenPos(this.pos, zoom, game.rocket.pos);

		let options = {
			fill: false,
			outline: true,
			outlineWidth: (10 * (this.size / 25))*zoom,
			outlineColor: this.color, 
		}

		// Draw the circle
		util.drawCircle(screenPos.x, screenPos.y, 0 + (this.size*zoom * (Date.now() - this.time)/this.duration), "white", options);
		if (Date.now() - this.time > this.duration) {
			this.finished = true;
		}
	}
}