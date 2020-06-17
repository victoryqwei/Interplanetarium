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
		this.zoom = 0.6;

		this.maxZoom = 3;
		this.minZoom = 0.6;
		this.mapZ = 0.00001;
		this.warp = false;

	}

	update() {
		this.pos = Vector.add(game.rocket.pos, this.offset);

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

		// Apply direction
		direction.normalize();
		direction.mult(3*delta);
		this.offset.x += direction.x;
		this.offset.y -= direction.y;
	}
}

export let camera = new Camera();