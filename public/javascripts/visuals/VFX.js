/*
	
Draw the Effects

*/

import Style from "../visuals/Style.js";
import {game} from "../game/Game.js";
import {camera} from "../visuals/Camera.js";
import {util} from "../util/Util.js";

export default class Effect {
	constructor(pos, type, options) {

		// Util
		this.style = new Style(ctx);

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
		let {style} = this;
		let zoom = camera.zoom;
		
		let screenPos = util.getScreenPos(this.pos, zoom, camera.pos);

		let options = {
			fill: false,
			outline: true,
			outlineWidth: (10 * (this.size / 25))*zoom,
			outlineColor: this.color, 
		}

		// Draw the drawCircle		
		style.drawCircle(screenPos.x, screenPos.y, 0 + (this.size*zoom * (Date.now() - this.time)/this.duration), "white", options);
		if (Date.now() - this.time > this.duration) {
			this.finished = true;
		}
	}

	animateDamage() {
		let {style} = this;
		let t = (Date.now() - this.time)/this.duration;

		if (t >= 1) {
			this.finished = true;
		} else {
			let zoom = camera.zoom;
			let screenPos = util.getScreenPos(this.pos, zoom, camera.pos);
			style.drawText(this.text, screenPos.x, screenPos.y - (100 * t), "bold " + this.size + "px Arial", this.color, "middle", "center", Math.max(this.alpha * (1-t), 0));
		}
	}
}