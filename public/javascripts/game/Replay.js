
/*

The replay feature of the game. Used for the death recapture events.

*/

import Rocket from "../player/Rocket.js";
import Sound from "./Sound.js";
import {vfx} from "../visuals/VFXManager.js";
import {camera} from "../visuals/Camera.js";
import {game} from "./Game.js";
import {util} from "../util/Util.js";
import {QuadTree, Rectangle, Point} from "../util/QuadTree.js"
import Vector from "../util/Vector.js"

class Replay {
	constructor() {
		this.data = [];
	}

	start(event, rocketLast) {

		// Change the games state
		game.state = "replay";

		// Crash event
		if (event == "crash") {
			camera.follow = false;
			camera.offset = Vector.copy(rocketLast.pos);		
		}

		// Death by turret event
 		if (event == "death") {
 			camera.zoom = 1.5;
 			camera.follow = false;

 			let planet = replay.data[0].planets[rocketLast.lastHit.id];
 			if (planet)
 				camera.offset = Vector.copy(planet.turrets[rocketLast.lastHit.turretId].pos);	
 		}

 		// Fill replay if too short
 		let ticks = game.rocket.respawnTime/1000 * 30;
 		if(replay.data.length < ticks) {
 			for (let i = 0; i < ticks-replay.data.length; i++) {
 				replay.data.unshift(replay.data[0]);
 			}
 		}

		// Set server settings
		let tps = 30;
		let tick = Math.round(1000/tps);
		let _rocketLast = rocketLast;

		let replayId = setInterval(function(){ 

			let data = replay.data[0];
			let rocket = game.rocket;

			if (data) {
				// Follow the turret bullet
				if (event == "death") {
					for (let m of data.missiles) {
						if (m.missileId == rocketLast.lastHit.missileId) {
							camera.offset = Vector.copy(m.realPos)
						}
					}
				}

				// Update rocket
				rocket.pos = data.rocket.pos;
				rocket.angle = data.rocket.angle;
				rocket.alive = data.rocket.alive;

				// Update planets
				game.screen.planets = data.planets;

				// Update missiles
				game.missiles = data.missiles;

				// Update players
				game.players = data.players;

				// Update vfx
				for (let i = 0; i < data.vfx.length; i++) {
					vfx.add(data.vfx[i].pos, data.vfx[i].type, data.vfx[i].options, false, true);
				}
		
				// Reset replay state
				replay.data.splice(0, 1);
				if (replay.data.length <= 0 || game.state != "replay" || camera.warp) {
					replay.end();
					clearInterval(replayId);
				}
			} 
		}, tick);
	}

	end() {
		// Reset camera
		camera.follow = true;
		camera.offset = new Vector();
		camera.zoom = camera.minZoom;

		// Reset game state
		game.state = "play";

		// Reset replay data
		if (replay.data.length > 0) {
			replay.data = [];
		}

		// Reset game
		game.rocket.angle = 0;
		game.screen.planets = {};
		game.missiles = [];
		game.players = {};

		if (game.rocket.lives <= 0) {
			game.rocket.endGame();
		}
	}

	update() {
		let rocket = game.rocket;

		// Replay
		if (!game.map) 
			return;

		// Add rocket
		let replayRocket = {
			pos: Vector.copy(rocket.pos),
			angle: rocket.angle,
			alive: rocket.alive
		}

		// Add planets
		let replayPlanets = {};

		for (let id in game.map.planets) {
			let p = game.map.planets[id]

			// Add turrets
			let replayTurrets = {};
			for (let id in p.turrets) {
				let t = p.turrets[id]
				replayTurrets[id] = {
					pos: t.pos,
					angle: t.angle,
					health: t.health,
					barrelHeading: t.barrelHeading,
					barrelShot: t.barrelShot
				};
			}

			// Add bases
			let replayBases = {};
			for (let id in p.bases) {
				let b = p.bases[id]
				replayBases[id] = {
					pos: b.pos,
					angle: b.angle,
				};
			}

			// Add planets
			replayPlanets[id] = {
				pos: p.pos,
				radius: p.radius,
				name: p.name,
				color: p.color,
				type: p.type,
				turrets: replayTurrets,
				bases: replayBases
			};
		}
		
		// Add missiles
		let replayMissiles = [];
		for (let i = 0; i < game.missiles.length; i++) {
			replayMissiles.push({
				pos: Vector.copy(game.missiles[i].realPos),
				realPos: Vector.copy(game.missiles[i].realPos),
				angle: game.missiles[i].angle,
				type: game.missiles[i].type,
				origin: game.missiles[i].origin,
				turretId: game.missiles[i].turretId,
				missileId: game.missiles[i].missileId
			})
		}

		// Add players
		let replayPlayers = {}
		for (let id in game.players) {
			let p = game.players[id].rocket
			replayPlayers[id] = {
				id: id,
				name: game.players[id].name,
				rocket: {
					pos: Vector.copy(p.pos),
					angle: p.angle,
					alive: p.alive
				}	
			}
		}

		// Add vfx
		let replayVfx = [];
		for (let i = 0; i < vfx.newEffects.length; i++) {
			replayVfx.push({
				type: vfx.newEffects[i].type,
				pos: Vector.copy(vfx.newEffects[i].pos),
				options: {
					alpha: vfx.newEffects[i].options.alpha,
					color: vfx.newEffects[i].options.color,
					duration: vfx.newEffects[i].options.duration,
					size: vfx.newEffects[i].options.size,
					text: vfx.newEffects[i].options.text,
					id: vfx.newEffects[i].options.id
				}
			})
		}

		// Create replay
		let replayData = {
			rocket: replayRocket,
			planets: replayPlanets,
			missiles: replayMissiles,
			players: replayPlayers,
			vfx: replayVfx
		}
		 
		// Update array
		if (game.state != "replay") {
			if (replay.data.length >= game.rocket.respawnTime/1000 * 30) {
				replay.data.splice(0, 1);
				replay.data.push(replayData);
			} else {
				replay.data.push(replayData);
			}
		}
	}
}

export let replay = new Replay();