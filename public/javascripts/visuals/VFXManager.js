/*

Handles all the visual effects of the game

*/

import VFX from "../visuals/VFX.js";
import {camera} from '../visuals/Camera.js';

class VFXManager {
	constructor() {
		this.effects = [];
		this.newEffects = [];
	}

	add(pos, type, options, server) {
		if (options.id != socket.id)
			this.effects.push(new VFX(pos, type, options));

		if (!server) {
			options.id = socket.id;
			this.newEffects.push({
				pos: pos, 
				type: type,
				options: options
			});
		}	
	}

	animate() {
		if (camera.warp)
			return;
		
		for (let effect of this.effects) {
			effect.animate();
		}

		this.update();
	}

	update() {
		for (let i = this.effects.length-1; i >= 0; i--) {
			let effect = this.effects[i];
			if (effect.finished)
				this.effects.splice(i, 1);
		}
	}
}

export let vfx = new VFXManager();