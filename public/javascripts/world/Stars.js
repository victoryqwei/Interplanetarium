/*

Creates the background star effect including the warp effect while using the warp drive

*/

import {input} from "../game/input.js";
import {game} from "../game/Game.js";

class Star {
	constructor() {
		this.x = random(-canvas.width, canvas.width);
		this.y = random(-canvas.height, canvas.height);
		this.z = random(0, canvas.width);

		this.px = [];
		this.py = [];
		this.pz = [];
	}

	// Animate the stars
	animate(rocket) {
		let keys = input.keys;

		let starDistance = 10;
		let dz = display.zoom;

		if (display.warp) {
			this.z -= delta*3; // Move the stars closer towards the screen
		} else if (display.state == "menu") {
			this.z -= delta/40;
		}

		// Checks if the star is within screen bounds and corrects its position
		if (this.x-rocket.pos.x/starDistance > canvas.width) {
			this.x = -canvas.width+rocket.pos.x/starDistance;
			this.px = [this.x];
		} else if (this.x-rocket.pos.x/starDistance < -canvas.width) {
			this.x = canvas.width+rocket.pos.x/starDistance;
			this.px = [this.x];
		}

		if (this.y-rocket.pos.y/starDistance > canvas.height) {
			this.y = -canvas.height+rocket.pos.y/starDistance;
			this.py = [this.y];
		} else if (this.y-rocket.pos.y/starDistance < -canvas.height) {
			this.y = canvas.height+rocket.pos.y/starDistance;
			this.py = [this.y];
		}

		// Checks if the star is beyond the screen and reset its position
		if (this.z <= 0) {
			this.z = canvas.width-1;
			this.pz = [canvas.width];
			this.x = random(-canvas.width, canvas.width)+rocket.pos.x/starDistance;
			this.px = [this.x];
			this.y = random(-canvas.height, canvas.height)+rocket.pos.y/starDistance;
			this.py = [this.y];
		}

		// Determine the position of the star on the screen
		let sx = scale((this.x-rocket.pos.x/starDistance) / this.z, 0, 1, 0, canvas.width)*dz;
		let sy = scale((this.y-rocket.pos.y/starDistance) / this.z, 0, 1, 0, canvas.height)*dz;

		let t = scale(this.z, 0, canvas.width, 12*dz, 0); // Gets the size of the star

		if (this.pz) {
			// Gets the previous position of the star
			let px = scale((this.px[0]-rocket.pos.x/starDistance) / this.pz[0], 0, 1, 0, canvas.width)*dz;
			let py = scale((this.py[0]-rocket.pos.y/starDistance) / this.pz[0], 0, 1, 0, canvas.height)*dz;

			// Draws the star
			this.drawStar(px, py, sx, sy, t);
		}

		// Stores the previous positions of the star
		let warpLength = display.warp ? 1000/delta/144 * 8 : 1;

		this.px.push(this.x);
		if (this.px.length > warpLength)
			this.px.shift();

		this.py.push(this.y);
		if (this.py.length > warpLength)
			this.py.shift();

		this.pz.push(this.z);
		if (this.pz.length > warpLength)
			this.pz.shift();
	}

	drawStar(px, py, sx, sy, t) {
		drawLine(px, py, sx, sy, "white", t, "round", game.sound.beatOpacity);
	}


}

export default class Stars {
	constructor(numberOfStars) {
		this.stars = [];

		for (let i = 0; i < numberOfStars; i++) {
			this.stars.push(new Star());
		}
	}

	animate(rocket, warp) {
		// Warp effect
		if (display.warp) {
			if (display.mapZ >= display.minZoom) {
				display.mapZ = display.minZoom;
				display.warp = false;
			} else {
				display.mapZ += delta/200 * display.mapZ;
			}
		}

		// Animate stars
		ctx.save();
		ctx.translate(canvas.width/2, canvas.height/2)
		for (let star of this.stars) {
			star.animate(rocket, warp);
		}
		ctx.restore();
	}
}