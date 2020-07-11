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
		this.stages = [];

		let t = Date.now();
		for (let i = 0; i < 10; i++) {
			this.stages.push(new Map(i));
		}
		console.log("Successfully built server maps in", Date.now()-t, "ms");

		// Log
		this.newLog = [];
	}

	update(io) {
		this.updatePlayers();
		this.updateMap();

		// Send data to clients
		this.sendData(io);
	}

	// Update map
	updateMap() {
		// Update stages
		for (let level of this.stages) {
			level.update(this.getPlayers(level.stage));
		}
	}

	// Update players in each stage
	updatePlayers() {
		/*for (let id in this.players) {
			let p = this.players[id];
			if (!p.rocket)
				 continue;

			let stageXp = p.stage*100+100;
			if (p.rocket && p.rocket.xp >= stageXp) {
				this.nextStage(id);
			}
		}*/
	}

	// Create new level
	nextStage(playerId) {
		let p = this.players[playerId];
		let stageXp = p.stage*100+100;
		if (p.rocket && p.rocket.xp < stageXp)
			return;
		// Update client level data
		if (this.players[playerId].stage + 1 > 9)
			return;

		this.players[playerId].stage += 1;
		console.log(this.players[playerId].name, "has moved to stage", this.players[playerId].stage + 1)
		this.io.to(playerId).emit("levelData", this.stages[this.players[playerId].stage]);

		for (let id in this.players) {
			if (this.players[id].stage == this.players[playerId].stage-1)
				this.io.to(id).emit("playerDisconnect", playerId);
		}
	}

	// Get the players of a certain stage
	getPlayers(stage) {
		let players = {};

		for (let id in this.players) {
			if (this.players[id].stage == stage) {
				players[id] = this.players[id];
			}
		}

		return players;
	}

	// Player joins the room
	join(id, name) {
		this.players[id] = {
			id: id,
			name: name,
			stage: 0
		}
		console.log(this.players[id].name + " joined room", this.id, "with id:", id, Date())
		this.io.to(this.id).emit("msg", "Successfully connected to ["+ this.id + "] with client id: [" + id + "] on " + Date());

		this.io.to(id).emit("levelData", this.stages[this.players[id].stage]);
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

			let stage = this.stages[this.players[data.id].stage]

			stage.missiles = stage.missiles.concat(data.missiles);
			stage.newMissiles = stage.newMissiles.concat(data.missiles);
			stage.newEffects = stage.newEffects.concat(data.effects);
		}
	}

	// Receive player log
	receiveLog(data, playerId) {
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
			"should have checked the fuel gage"],
			edge: ["looked to far away", 
			"flew to far out there"]
		}

		let msg = data.name + " " + messages[data.type][Util.randInt(0, messages[data.type].length-1)] + " [Stage " + (this.players[playerId].stage + 1) + "]";

		this.newLog.push(msg);
	}

	// Send data
	sendData(io) {
		for (let id in this.players) {
			let stage = this.stages[this.players[id].stage]

			// Only send map data in client's viewing range
			let map = {
				planets: {},
				missiles: stage.newMissiles,
				effects: stage.newEffects,
				experience: stage.newXP
			}

			// Get planets in viewing range
			let rocket = this.players[id].rocket;
			if (rocket) {
				let range = new Rectangle(rocket.pos.x, rocket.pos.y, 2000, 2000);
				let points = stage.qtree.query(range);
				for (let p of points) {
					if (p.data instanceof Planet) {
						let planet = p.data;

						map.planets[planet.id] = planet;
					}
				}
			}

			// Send update
			io.to(id).emit('update', {
				players: this.getPlayers(this.players[id].stage),
				map: map,
				log: this.newLog
			})
		}

		// Reset
		for (let stage of this.stages) {
			this.newLog = [];
			stage.newMissiles = [];
			stage.newEffects = [];
			stage.newXP = [];
		}
	}
}