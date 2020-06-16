/*

Used to draw everything to the screen.

*/

import Stars from "../world/Stars.js";
import Planet from "../world/Planet.js";
import Rocket from "../player/Rocket.js";
import Vector from "../util/Vector.js";
import {vfx} from "./VFXManager.js";
import {input} from "../game/input.js";
import {game} from "../game/Game.js";
import {Rectangle} from "../util/QuadTree.js";

export default class Animate {
	constructor() {
		this.stars = new Stars(1000);
	}

	animateAll() {
		this.animateBackground();
		this.animateStars();
		if (display.state == "play") {
			this.animateMissiles();
			this.animatePlanets();
			this.animateRocket();
			this.animatePlayers();
			this.animateVfx();
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
		Rocket.display(game.rocket, false, true, game.rocket.name);
	}

	animatePlayers() {
		for (let id in game.players) {
			if (id != socket.id)
				Rocket.display(game.players[id].rocket, true, true, game.players[id].name);
		}
	}

	animatePlanets() {
		if (!game.map)
			return;
		for (let id in game.screen.planets) {
			let planet = game.screen.planets[id];
			Planet.display(planet.pos, planet.radius, planet.type, {
				color: planet.color,
				strokeColor: planet.strokeColor
			});
			Planet.displayTurret(planet);
		}
	}

	animateMissiles() {

		if (display.warp)
			return;

		let zoom = display.zoom;
		let rocket = game.rocket;

		for (let i = game.missiles.length-1; i >= 0; i--) {
			let m = game.missiles[i];

			// Set missile color
			let color = "red";
			if (m.type == "seeking")
				color = "Fuchsia";
			if (m.origin == "player")
				color = "lime";

			// Extrapolate missile position
			let t = Date.now()-m.time;
			let pos = Vector.copy(m.pos);

			if (m.type == "laser") {
				let deltaPos = Vector.mult(m.heading, t)
				deltaPos.mult(m.speed);
				pos.add(deltaPos);
			}

			// Seeking missile
			if (m.type == "seeking" && getDistance(m.pos, rocket.pos) < 1000) {
				let target = Vector.normalize(Vector.sub(rocket.pos, pos))
				m.acc = target;
				m.vel = Vector.add(m.vel, Vector.mult(m.acc, t));
				m.vel = Vector.mult(Vector.normalize(m.vel), 1000 * m.speed);

				m.angle = Math.atan2(target.y, target.x)
			}

			pos.add(Vector.mult(m.vel, t/1000));

			// Draw the missile
			let screenPos = getScreenPos(pos, display.zoom, game.rocket.pos);
			drawRect(screenPos.x, screenPos.y, 24*zoom, 8*zoom, m.angle, color);

			// Check if projectile is too old
			let old = t > 1000/m.speed;
			let playerCollision = m.id != socket.id && getDistance(rocket.pos.x, rocket.pos.y, pos.x, pos.y) < 40;
			let planetCollision = false;

			for (let id in game.screen.planets) {
				let planet = game.screen.planets[id];

				if (getDistance(planet.pos.x, planet.pos.y, pos.x, pos.y) < planet.radius)
					planetCollision = true;
			}

			if (old || playerCollision || planetCollision) {
				game.missiles.splice(i, 1)
			}

			if (playerCollision || planetCollision) {
				vfx.add(pos, "explosion", {size: 10, alpha: 1, duration: 100, color: color})
			}

			if (playerCollision)
				vfx.add(pos, "damage", {size: 20, alpha: 1, duration: 1000, text: -1, color: color})

			if (playerCollision)
				game.rocket.integrity -= 1;
		}
	}

	animateVfx() {
		vfx.animate();
	}
}