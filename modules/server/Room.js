/*

Manages a room including the server logistics of the game

TODO:

- Idle rooms will self destruct

*/

var Map = require('../world/Map.js');

module.exports = class Room {
	constructor(id, io) {
		// Room information
		this.id = id;
		this.io = io;

		// Players

		this.players = {};

		// Map

		this.map = new Map(100);

	}

	update(io) {

		io.to(this.id).emit('update', {
			players: this.players
		})

	}

	// Player joins the room
	join(id) {
		this.players[id] = {
			id: id
		}
		console.log("Joined room", this.id, "with id:", id, Date())
		this.io.to(this.id).emit("msg", "Joined room "+ this.id + " with id: " + id + " " + Date());

		this.io.to(id).emit("mapData", this.map);
	}

	leave(id) {
		this.io.to(this.id).emit("playerDisconnect", id);
		delete this.players[id];
	}

	// Receive player data
	receivePlayerData(data) {
		if (this.players[data.id])
			Object.assign(this.players[data.id], data)
	}
}