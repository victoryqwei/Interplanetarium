
/*

Stores all the variables for the game

*/

import Rocket from "../player/Rocket.js";
import Sound from "./Sound.js";
import {vfx} from "../visuals/VFXManager.js";
import {camera} from "../visuals/Camera.js";
import {QuadTree, Rectangle, Point} from "../util/QuadTree.js"

class Game {
	constructor() {
		// Game settings
		this.settings = {
			quality: "high", // low, medium, high
			displayMarkers: "modern", // modern, legacy
		}

		// Player data
		this.rocket = new Rocket();

		// World data
		this.map = undefined; // The entire map
		this.mapQ = undefined; // The map in a quadtree (easy collision detection)
		this.screen = undefined; // Everything in the screen;
		this.radar = undefined; // Everything in the minimap;

		// Server data
		this.players = {};
		this.missiles = [];

		// Sound data
		this.sound = new Sound();

		this.log = [];

		this.state = "menu"; // "menu", "play", "settings", "starmap"
	}

	update() {
		this.updateScreen();

		this.rocket.update();
		this.sound.music();
		camera.update();

	}

	start() { // Starts the game - This officially starts the game process
		let rocket = this.rocket;

		let tps = 30;
		let tick = Math.round(1000/tps);

		// Client -> Server loop
		setInterval(function () {
			socket.emit('update', {
				id: socket.id,
				rocket: {
					pos: rocket.pos,
					vel: rocket.vel,
					angle: rocket.angle,
					integrity: rocket.integrity,
					thrust: rocket.thrust,
					alive: rocket.alive,
					xp: rocket.xp
				},
				missiles: rocket.newMissiles,
				effects: vfx.newEffects,
			})

			rocket.newMissiles = [];
			vfx.newEffects = [];
		}, tick)

		this.state = "play";
	}

	updateScreen() {
		if (!this.mapQ)
			return;

		// Update the objects that are in the screen
		this.screen = {
			planets: {},
			players: {}
		}

		let zoom = camera.zoom;

		// Update screen objects
		let range = new Rectangle(camera.pos.x, camera.pos.y, canvas.width/zoom, canvas.height/zoom);
		if (camera.warp)
			range = new Rectangle(0, 0, this.map.mapRadius, this.map.mapRadius);
		let points = this.mapQ.query(range);

		for (let p of points) {
			this.screen.planets[p.data.id] = p.data;
		}
	}

	receivePlayerData(players) {

		// Receive and update player information
		for (let id in players) {
			let player = this.players[id];
			if (!this.players[id]) { // Add new player
				this.players[id] = {
					id: players[id].id,
					rocket: {
						pos: Ola({
							x: 0,
							y: 0
						}),
						intAngle: Ola(0),
						angle: 0,
						particles: []
					}
				};
			} else if (players[id].rocket) { // Update existing player
				player.rocket.pos.x = players[id].rocket.pos.x;
				player.rocket.pos.y = players[id].rocket.pos.y;

				player.rocket.intAngle.value = players[id].rocket.angle;
				player.rocket.angle = player.rocket.intAngle.value;

				player.rocket.integrity = players[id].rocket.integrity;
				player.rocket.thrust = players[id].rocket.thrust;
				player.rocket.alive = players[id].rocket.alive;

				player.name = players[id].name;
			}
		}
	}

	receiveMapData(map) {
		// Create map quadtree
		this.mapQ = new QuadTree(new Rectangle(0, 0, this.map.mapRadius, this.map.mapRadius), 4)

		for (let id in map.planets) {
			let p = map.planets[id];

			var point = new Point(p.pos.x, p.pos.y, p.radius, map.planets[id]);
			this.mapQ.insert(point);
		}

		// Update planets
		for (let id in map.planets) {
			let p = map.planets[id]
			this.map.planets[id] = p;

			var point = new Point(p.pos.x, p.pos.y, p.radius, p);
			this.mapQ.insert(point);
		}

		// Update missiles
		for (let m of map.missiles) {
			if (m.id == socket.id)
				continue;
			if (m.type == "player") {
				m.pos = Vector.copy(this.players[m.id].rocket.pos);
			}
			m.time = Date.now();
			this.missiles.push(m);
		}

		// Update new effects
		for (let e of map.effects) {
			vfx.add(e.pos, e.type, e.options, true);
		}

		// Update player experience
		for (let e of map.experience) {
			if (e.id == socket.id) {
				this.rocket.xp += e.xp;
			}
		}
	}

	receiveLevelData(data) {
		this.players = {};

		this.map = data;

		this.rocket.xp = 0;

		// Create map quadtree
		this.mapQ = new QuadTree(new Rectangle(0, 0, this.map.mapRadius, this.map.mapRadius), 4)

		for (let id in this.map.planets) {
			let p = this.map.planets[id];

			for (let id in p.turrets) {
				let t = p.turrets[id];
			}

			var point = new Point(p.pos.x, p.pos.y, p.radius, this.map.planets[id]);
			this.mapQ.insert(point);
		}

		// Warp to level location
		camera.warp = true;
		camera.mapZ = 0.00001;

		this.rocket.respawn(true);
	}

	receiveLogData(data) {

		for (let msg of data) {
			this.log.push(msg);
			setTimeout(function(){ 
				game.log.splice(0, 1);
			}, 5000)
		}
		
	}

	sendLog(type) {		
		socket.emit("serverLog", {
			name: this.rocket.name,
			type: type
		});
	}
}

export let game = new Game();