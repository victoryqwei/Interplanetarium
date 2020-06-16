/*

Draws the planet and everything on it

*/

import {game} from '../game/Game.js';

export default class Planet {
	static display(pos, radius, type, config) {
		let zoom = display.warp ? display.mapZ : display.zoom;
		let rocket = game.rocket;
		ctx.save();

		let options = {
			outline: true,
			outlineWidth: 10*zoom,
			outlineColor: config.strokeColor || pSBC(-0.2, config.color, false, true), 
			glow: true,
			glowColor: config.color,
			glowWidth: 100*zoom
		}

		if ((display.performanceMode || display.warp) && !inScreen(pos, false, radius, rocket.pos)) {
			options.glow = false;
			options.outline = false;
		}

		var screenPos = getScreenPos(pos, zoom, rocket.pos);

		// Draw Planet
		if(type == "Planet") {
			drawCircle(screenPos.x, screenPos.y, radius*zoom, config.color, options);
		} else if(type == "Black Hole") {
			drawCircle(screenPos.x, screenPos.y, radius*zoom, config.color, options);
		}
		ctx.restore();
	}

	static displayTurret(planet) {
		let zoom = display.warp ? display.mapZ : display.zoom;
		let rocket = game.rocket;
		// Draw turrets
		for (let id in planet.turrets) {
			let t = planet.turrets[id];
			if (inScreen(t.pos, false, 100*zoom, rocket.pos)) {
				var screenPos = getScreenPos(t.pos, zoom, rocket.pos);
				
				var turretBarrel = new Vector(t.barrelHeading.x, t.barrelHeading.y);
				turretBarrel.mult(20 + (10 * (Math.min(t.barrelShot, 20) / 20)) * zoom);

				let screenBarrel = Vector.add(screenPos.copy(), turretBarrel.copy());
				let color = "#4a4a4a";

				// Draw turret
				drawLine(screenPos.x, screenPos.y, screenPos.x+turretBarrel.x, screenPos.y+turretBarrel.y, color, 10*zoom, "butt")
				drawRotatedRoundedRect(screenPos.x, screenPos.y, 35*zoom, 25*zoom, 4*zoom, pSBC(Math.max(-(1-t.health/20),-1), "#a3a3a3", false, true), t.angle + Math.PI/2);

				//drawText(t.barrelShot, screenPos.x, screenPos.y, 10*zoom + "px Arial", "white", "center", "middle", 0.8);

			}
		}
	}

	displayBase() {
		let zoom = display.zoom;
		// Draw turrets
		for (let id in this.bases) {
			let b = this.bases[id];
			if (inScreen(b.pos, false, 100*zoom)) {
				var screenPos = getScreenPos(b.pos, zoom);
				if(b.level == 1) {
					drawImage(base_level1, screenPos.x, screenPos.y, 40*zoom, 30*zoom, b.angle + Math.PI/2);
				} else if(b.level == 2) {
					drawImage(base_level2, screenPos.x, screenPos.y, 40*zoom, 38*zoom, b.angle + Math.PI/2);
				} else if(b.level == 3) {
					drawImage(base_level3, screenPos.x, screenPos.y, 40*zoom, 58*zoom, b.angle + Math.PI/2);
				}
			}
		}
	}
}