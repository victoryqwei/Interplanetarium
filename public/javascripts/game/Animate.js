/*

Used to draw everything to the screen.

*/

import Stars from "../world/Stars.js";
import Planet from "../world/Planet.js";
import Rocket from "../player/Rocket.js";
import {input} from "./input.js";
import {game} from "./Game.js";

export default class Animate {
	constructor() {
		this.stars = new Stars(1000);
	}

	animateAll() {
		this.animateBackground();
		this.animateStars();
		this.animatePlanets();
		if(display.state == "play" && !display.warp) {
			this.animateRocket();
			this.animatePlayers();
		}
	}

	animateBackground() {
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawRectangle(0, 0, canvas.width, canvas.height, "#000408")
	}

	animateStars() {
		this.stars.animate(game.rocket);
	}

	animateRocket() {
		Rocket.display(game.rocket, false, true);
	}

	animatePlayers() {
		for (let id in game.players) {
			if (id != socket.id)
				Rocket.display(game.players[id].rocket, true, true);
		}
	}

	animatePlanets() {
		if (!game.map)
			return;
		
		for (let id in game.map.planets) {
			let planet = game.map.planets[id];
			Planet.display(planet.pos, planet.radius, planet.type, {
				color: planet.color,
				strokeColor: planet.strokeColor
			});
		}
	}

}