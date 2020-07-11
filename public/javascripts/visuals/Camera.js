/*

The main game viewport

*/
import Vector from "../util/Vector.js";
import {input} from "../game/input.js";
import {game} from "../game/Game.js";

class Camera {
	constructor() {

		this.pos = new Vector();
		this.offset = new Vector();
		this.starOffset = new Vector();
		this.zoom = 0.6;

		// Camera zoom
		this.maxZoom = 3;
		this.minZoom = 0.6;

		this.mapZ = 0.00001;
		this.warp = false;
		this.backWarp = false;
		this.warpPerc = 0;

		// Camera settings
		this.follow = true;
		this.toggle = false;

	}

	update() {
		if(this.follow) {
			this.pos = Vector.add(game.rocket.pos, this.offset);
		} else {
			this.pos = this.offset.copy();
		}

		let keys = input.keys;

		var direction = new Vector(0, 0);
		if(keys[100])
				direction.x -= 1;
		if(keys[104])
				direction.y += 1;
		if(keys[102])
				direction.x += 1;
		if(keys[101])
				direction.y -= 1;
		if(keys[36])
			this.offset = new Vector();
		if(keys[35]) {
			if(!this.toggle) {
				if(this.follow) {
					this.offset = this.pos.copy();
					
				} else {
					this.offset = Vector.sub(this.pos.copy(), game.rocket.pos.copy());
					this.pos = Vector.add(game.rocket.pos, this.offset);;

				}
				this.toggle = true;
				this.follow = !this.follow;
			}
		} else {
			if (this.toggle) {
				this.toggle = false;
			}
		}

		// Apply direction
		direction.normalize();
		direction.mult(1*delta);
		this.offset.x += direction.x;
		this.offset.y -= direction.y;
	}
}

export let camera = new Camera();