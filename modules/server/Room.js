/*

Manages a room including the server logistics of the game

TODO:

- Idle rooms will self destruct

*/

var Map = require('../world/Map.js');
var Planet = require('../world/Planet.js');
var Util = require('../util/Util.js');

var {QuadTree, Rectangle, Point} = require('../util/QuadTree.js');

module.exports = class Room {
	constructor(id, io) {
		// Room information
		this.id = id;
		this.io = io;

		// Players

		this.players = {};

		// Map

		this.map = new Map(50);

		// Log

		this.newLog = [];
	}

	update(io) {
		// Update map
		this.map.update(this.players);

		// Send data to clients
		this.sendData(io);
	}

	// Create new level
	createNewLevel(data) {
		// Generate level
		this.map = new Map(100);

		// Update client level data
		for (let id in this.players) {
			this.io.to(id).emit("levelData", this.map);
		}
	}

	// Player joins the room
	join(id, name) {
		this.players[id] = {
			id: id,
			name: name
		}
		console.log(this.players[id].name + " joined room", this.id, "with id:", id, Date())
		this.io.to(this.id).emit("msg", "Joined room "+ this.id + " with id: " + id + " " + Date());

		this.io.to(id).emit("levelData", this.map);
	}

	// Leave room
	leave(id) {
		this.io.to(this.id).emit("playerDisconnect", id);
		delete this.players[id];
	}

	// Receive player data
	receivePlayerData(data) {
		if (this.players[data.id]) {
			Object.assign(this.players[data.id], data)
			for (let m of data.missiles) {
				m.time = Date.now();
			}

			this.map.missiles = this.map.missiles.concat(data.missiles);
			this.map.newMissiles = this.map.newMissiles.concat(data.missiles);
			this.map.newEffects = this.map.newEffects.concat(data.effects);
		}
	}

	// Receive player log
	receiveLog(data) {
		let messages = {
			death: ["felt the laser power",
			"was burnt to a crisp", 
			"was shot by an enemy",
			"failed intergalactic army training",
			"died in combat",
			"lost to the aliens",
			"forgot to shoot",
			"loves the sound of explosions"],
			crash: ["forgot their landing gear", 
			"didn't check their thrust", 
			"tried too hard to be spaceX", 
			"tried too hard to be NASA", 
			"felt the weight of gravity", 
			"never looked back", 
			"forgot to pull up", 
			"was crushed by their own incompetence", 
			"ignored the warning system", 
			"failed flying school",
			"has fatally crashed",
			"should have just not",
			"didn't read the manual",
			"can't be bothered to land"],
			fuel: ["should have stopped for gas", 
			"should have checked the fuel gage"]
		}

		let msg = data.name + " " + messages[data.type][Util.randInt(0, messages[data.type].length-1)];

		this.newLog.push(msg);
	}

	// Send data
	sendData(io) {
		for (let id in this.players) {
			// Only send map data in client's viewing range
			let map = {
				planets: {},
				missiles: this.map.newMissiles,
				effects: this.map.newEffects
			}

			// Get planets in viewing range
			let rocket = this.players[id].rocket;
			if (rocket) {
				let range = new Rectangle(rocket.pos.x, rocket.pos.y, 2000, 2000);
				let points = this.map.qtree.query(range);
				for (let p of points) {
					if (p.data instanceof Planet) {
						let planet = p.data;

						map.planets[planet.id] = planet;
					}
				}
			}

			// Send update
			io.to(id).emit('update', {
				players: this.players,
				map: map,
				log: this.newLog
			})
		}

		this.newLog = [];
		this.map.newMissiles = [];
		this.map.newEffects = [];
		
	}
}