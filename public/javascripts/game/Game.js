/*

Stores all the variables for the game

*/

import Rocket from "../player/Rocket.js";
import Sound from "./Sound.js";

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
		this.map = undefined;

		// Server data
		this.players = {};

		// Sound data
		this.sound = new Sound();
	}

	update() {
		if (display.warp)
			return;

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
		console.log(data);
	}
}

export let game = new Game();