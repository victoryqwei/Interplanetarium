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
		this.text = options.text || undefined;
	}

	animate() {	

		// Switch
		switch (this.type) {
			case "explosion":
				this.animateExplosion();
			break;

			case "damage":
				this.animateDamage();
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

		// Draw the drawCircle		
		util.drawCircle(screenPos.x, screenPos.y, 0 + (this.size*zoom * (Date.now() - this.time)/this.duration), "white", options);
		if (Date.now() - this.time > this.duration) {
			this.finished = true;
		}
	}

	animateDamage() {
		let {util} = this;
		let t = (Date.now() - this.time)/this.duration;

		if (Date.now() - this.time > this.duration) {
			this.finished = true;
		} else {
			let zoom = display.zoom;
			let screenPos = getScreenPos(this.pos, zoom, game.rocket.pos);
			drawText(this.text, screenPos.x, screenPos.y - (100 * t), "bold " + this.size + "px Arial", this.color, "middle", "center", this.alpha * Math.max((1-t), 0));
		}
	}
}