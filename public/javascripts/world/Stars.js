
/*

Creates the background star effect including the warp effect while using the warp drive

*/

import {input} from "../game/input.js";
import {game} from "../game/Game.js";
import {QuadTree, Rectangle, Circle, Point} from "../util/QuadTree.js"
import {camera} from '../visuals/Camera.js';
import Style from "../visuals/Style.js";
import {draw} from "../visuals/Draw.js";
import {util} from "../util/Util.js";
import Vector from "../util/Vector.js";

class Star {
	constructor() {
		this.x = util.random(-canvas.width, canvas.width);
		this.y = util.random(-canvas.height, canvas.height);
		this.z = util.random(0, canvas.width);

		this.px = [];
		this.py = [];
		this.pz = [];
	}

	// Animate the stars
	animate(rocket, qTree, tick) {
		let keys = input.keys;

		let starDistance = 10;
		let dz = camera.zoom;

		let pos = Vector.sub(camera.pos, camera.starOffset);

		if (camera.warp) {
			this.z -= delta*(1 - Math.abs(util.constrain(tick/1000, 0, 1) - 0.5) * 2)*3; // Move the stars closer towards the screen
		} else if (game.state == "menu") {
			this.z -= delta/30;
		}

		// Checks if the star is within screen bounds and corrects its position
		if (this.x-pos.x/starDistance > canvas.width) {
			this.x = -canvas.width-pos.x/starDistance;
			this.px = [this.x];
		} else if (this.x-pos.x/starDistance < -canvas.width) {
			this.x = canvas.width+pos.x/starDistance;
			this.px = [this.x];
		}


		if (this.y-pos.y/starDistance > canvas.height) {
			this.y = -canvas.height-pos.y/starDistance;
			this.py = [this.y];
		} else if (this.y-pos.y/starDistance < -canvas.height) {
			this.y = canvas.height+pos.y/starDistance;
			this.py = [this.y];
		}

		// Checks if the star is beyond the screen and reset its position
		if (this.z <= 0) {
			this.z = canvas.width-1;
			this.pz = [canvas.width];
			this.x = util.random(-canvas.width, canvas.width)+pos.x/starDistance;
			this.px = [this.x];
			this.y = util.random(-canvas.height, canvas.height)+pos.y/starDistance;
			this.py = [this.y];
		}

		// Determine the position of the star on the screen
		let sx = util.scale((this.x-pos.x/starDistance) / this.z, 0, 1, 0, canvas.width)*dz;
		let sy = util.scale((this.y-pos.y/starDistance) / this.z, 0, 1, 0, canvas.height)*dz;

		let t = util.scale(this.z, 0, canvas.width, 12*dz, 0); // Gets the size of the star

		if (this.pz) {
			// Gets the previous position of the star
			let px = util.scale((this.px[0]-pos.x/starDistance) / this.pz[0], 0, 1, 0, canvas.width)*dz;
			let py = util.scale((this.py[0]-pos.y/starDistance) / this.pz[0], 0, 1, 0, canvas.height)*dz;

			// Draws the star
			draw.drawStar(px, py, sx, sy, t);

			// Add to the quadtree
			qTree.insert(new Point(sx + canvas.width/2, sy + canvas.height/2, 1, {
				t: t
			}))
		}

		// Stores the previous positions of the star
		let starLength = (1 - Math.abs(util.constrain(tick/1000, 0, 1) - 0.5) * 2) * 20;
		let warpLength = camera.warp ? 1000/delta/144 * starLength : 1;

		camera.warpPerc = Math.abs(util.constrain(tick/1000, 0, 1));

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
}

export default class Stars {
	constructor(numberOfStars) {
		this.starCount = numberOfStars
		this.stars = [];
		this.starQ = undefined;

		this.t = 0;

		for (let i = 0; i < numberOfStars; i++) {
			this.stars.push(new Star());
		}
	}

	animate(rocket, warp) {
		// Warp effect
		this.animateWarp();

		// Animate stars
		this.animateStars(rocket);

		// Animate star warp effect
		draw.drawWarp(this.starQ);
	}

	animateWarp() {
		if (camera.warp) {
			if (camera.mapZ >= camera.minZoom) {
				camera.mapZ = camera.minZoom;
				camera.warp = false;
			} else {
				this.t += delta/3;
				camera.mapZ = 0.00001 * Math.pow(1.01, this.t);
			}
		} else {
			this.t = 0;
		}
	}

	animateStars(rocket) {
		this.starQ = new QuadTree(new Rectangle(canvas.width/2, canvas.height/2, canvas.width, canvas.height), 5);

		ctx.save();
		ctx.translate(canvas.width/2, canvas.height/2)
		for (let star of this.stars) {
			star.animate(rocket, this.starQ, this.t);
		}
		ctx.restore();
	}
}