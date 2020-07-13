/*

Used to draw everything to the screen.

*/

import Stars from "../world/Stars.js";
import Rocket from "../player/Rocket.js";
import Vector from "../util/Vector.js";
import {vfx} from "./VFXManager.js";
import {input} from "../game/input.js";
import {game} from "../game/Game.js";
import {Rectangle} from "../util/QuadTree.js";
import {camera} from '../visuals/Camera.js';
import {draw} from "../visuals/Draw.js";
import Style from "../visuals/Style.js";
import {util} from "../util/Util.js";

export default class Animate {
	constructor() {
		this.style = new Style(ctx);
		this.stars = new Stars(1000);
	}

	animateAll() {
		this.animateBackground();
		this.animateStars();
		if (game.state != "menu") {
			this.animateMissiles();
			this.animatePlanets();
			this.animateBorder();
			this.animateRocket();
			this.animatePlayers();
			this.animateVfx();
		}
	}

	animateBackground() {
		// Draw the off-black background
		let {style} = this;
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		style.drawRectangle(0, 0, canvas.width, canvas.height, "#000408")
	}

	animateBorder() {
		// Draw the map border
		let {style} = this;

		if (!game.map)
			return;

		if (!game.rocket)
			return;

		// Draw the fade to black close to blackhole
		let zoom = camera.warp ? camera.mapZ : camera.zoom;
		var originPos = util.getScreenPos(new Vector(), zoom, camera.pos);
		if (!camera.warp && game.rocket.closestPlanet) {
			if (game.rocket.closestPlanet.type == "blackhole") {
				ctx.globalCompositeOperation = 'destination-atop';
				style.drawCircle(originPos.x, originPos.y, game.map.mapRadius*zoom, "rgba(0,4,8," + Math.min(game.rocket.closestPlanetDistance/300, 1)+")");
			} else {
				ctx.globalCompositeOperation = 'destination-atop';
				style.drawCircle(originPos.x, originPos.y, game.map.mapRadius*zoom, "rgba(0,4,8,1)");
			}
		}
		ctx.globalCompositeOperation = 'source-over';
		style.drawCircle(originPos.x, originPos.y, game.map.mapRadius*zoom, "white", {fill: false, outline: true, outlineWidth: 10*zoom, outlineColor: "white"})
		

	}

	animateStars() {
		//Animate the star warp
		this.stars.animate(game.rocket);
	}

	animateRocket() {
		// Draw the game rocket
		draw.drawRocket(game.rocket, false, true, game.rocket.name, true);
	}

	animatePlayers() {
		// Draw the players rockets
		for (let id in game.players) {
			if (id != socket.id) {
				if(camera.warp) {
					draw.drawRocket(game.players[id].rocket, true, true, game.players[id].name, false);
				} else {
					draw.drawRocket(game.players[id].rocket, true, true, game.players[id].name, true);
				}
			}
		}
	}

	animatePlanets() {
		// Draw the planets
		if (!game.map)
			return;
		for (let id in game.screen.planets) {
			let planet = game.screen.planets[id];
			if (planet) {
				draw.drawPlanet(planet.pos, planet.radius, planet.type, {
					color: planet.color,
					name: planet.name
				});
				draw.drawTurret(planet);
				draw.drawBase(planet);
			}
		}
	}

	animateMissiles() {
		// Draw the missiles
		let {style} = this;

		if (camera.warp)
			return;

		let zoom = camera.zoom;
		let rocket = game.rocket;

		// Update missiles
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

			if (game.state != "replay") {

				// Add laser missles
				if (m.type == "laser") {
					let deltaPos = Vector.mult(m.heading, t)
					deltaPos.mult(m.speed);
					pos.add(deltaPos);
				}

				// Add seeking missiles
				if (m.type == "seeking" && util.getDistance(m.pos, rocket.pos) < 1000) {
					let target = Vector.normalize(Vector.sub(rocket.pos, pos))
					m.acc = target;
					m.vel = Vector.add(m.vel, Vector.mult(m.acc, t));
					m.vel = Vector.mult(Vector.normalize(m.vel), 1000 * m.speed);

					m.angle = Math.atan2(target.y, target.x)
				}

				// Add the positions
				pos.add(Vector.mult(m.vel, t/1000));
				game.missiles[i].realPos = pos.copy();
			}

			// Draw the missile
			let screenPos = util.getScreenPos(pos, camera.zoom, camera.pos);
			style.drawRect(screenPos.x, screenPos.y, 24*zoom, 8*zoom, m.angle, color);

			if (game.state != "replay") {

				// Check if projectile is too old
				let old = t > 1000/m.speed;
				let playerCollision = m.id != socket.id && util.getDistance(rocket.pos.x, rocket.pos.y, pos.x, pos.y) < 40 && rocket.alive;
				let planetCollision = false;

				// Detect planet collision
				for (let id in game.screen.planets) {
					let planet = game.screen.planets[id];
					if (util.getDistance(planet.pos.x, planet.pos.y, pos.x, pos.y) < planet.radius)
						planetCollision = true;
					for (let id in planet.bases) {
						let base = planet.bases[id];
						if (util.getDistance(base.pos.x, base.pos.y, pos.x, pos.y) < base.radius)
							planetCollision = true;
					}
				}

				// Add vfx explosion at collision
				if (playerCollision || planetCollision) {
					vfx.add(pos, "explosion", {size: 10, alpha: 1, duration: 100, color: color}, false, false)
				}

				// Add vfx at player collosion
				if (playerCollision) {
					vfx.add(pos, "damage", {size: 20, alpha: 1, duration: 1000, text: -(m.damage || 1), color: color}, false, false)
					game.rocket.integrity -= m.damage;
					if (game.rocket.integrity <= 0 && game.rocket.alive) {
						game.rocket.lastHit = {
							id: m.id,
							turretId: m.turretId,
							missileId: m.missileId
						};
						vfx.add(pos, "explosion", {size: 100, alpha: 1, duration: 200}, false, false)
					}
				}

				// Remove missile if too old
				if (old || playerCollision || planetCollision) {
					game.missiles.splice(i, 1)
				}
			}
		}
	}

	animateVfx() {
		// Animate the vfx
		vfx.animate();
	}
}