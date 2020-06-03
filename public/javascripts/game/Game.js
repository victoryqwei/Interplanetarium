
/*

Stores all the variables for the game

*/

import Rocket from "../player/Rocket.js";
import Sound from "./Sound.js";
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

		// Server data
		this.players = {};

		// Sound data
		this.sound = new Sound();
	}

	update() {
		this.updateScreen();

		this.rocket.update();
		this.sound.music();
	}

	start() { // Starts the game - This should officially start the game process
		let rocket = this.rocket;
		// Client -> Server loop
		setInterval(function () {
			socket.emit('update', {
				id: socket.id,
				rocket: {
					pos: rocket.pos,
					angle: rocket.angle,
					integrity: rocket.integrity,
					thrust: rocket.thrust
				}
			})
		}, 20)

		display.state = "play";
	}

	updateScreen() {
		if (!this.mapQ)
			return;

		// Update the objects that are in the screen

		this.screen = {
			planets: [],
			players: []
		}

		let zoom = display.zoom;
		let rocket = this.rocket;

		let range = new Rectangle(rocket.pos.x, rocket.pos.y, canvas.width/zoom, canvas.height/zoom);
		if (display.warp)
			range = new Rectangle(0, 0, this.map.mapRadius, this.map.mapRadius);
		let points = this.mapQ.query(range);

		for (let p of points) {
			this.screen.planets.push(p.data);
		}
	}

	receivePlayerData(data) {
		// Receive and update player information
		for (let id in data.players) {
			let player = this.players[id];
			if (!this.players[id]) { // Add new player
				this.players[id] = {
					id: data.players[id].id,
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
			} else if (data.players[id].rocket) { // Update existing player
				player.rocket.pos.x = data.players[id].rocket.pos.x;
				player.rocket.pos.y = data.players[id].rocket.pos.y;

				player.rocket.intAngle.value = data.players[id].rocket.angle;
				player.rocket.angle = player.rocket.intAngle.value;

				player.rocket.integrity = data.players[id].rocket.integrity;
				player.rocket.thrust = data.players[id].rocket.thrust;
			}
		}
	}

	receiveMapData(data) {
		this.map = data;

		// Create map quadtree
		this.mapQ = new QuadTree(new Rectangle(0, 0, this.map.mapRadius, this.map.mapRadius), 4)

		for (let id in this.map.planets) {
			let p = this.map.planets[id];
			var point = new Point(p.pos.x, p.pos.y, p.radius, p);
			this.mapQ.insert(point)
		}

		console.log(this.mapQ)
	}
}

export let game = new Game();