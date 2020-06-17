/*

Receives events from the server

*/

import {game} from "./Game.js";

// Define
let tick = Date.now();
let tpsArray = [];
window.averageTps = 0;
let latencyArray = [];
window.averageLatency = 0;

(function () {

	window.socket = io("/");

	// Receive message
	socket.on("msg", function (msg) {
		console.log(msg);
	})

	// Receive server update
	socket.on('update', function (data) {
		game.receivePlayerData(data.players); // Receive and update data from other players
		game.receiveMapData(data.map); // Receive and updata map data
		game.receiveLogData(data.log);

		if (Date.now() - tick > 0) {
			tpsArray.push((1000 / (Date.now() - tick)));
			tick = Date.now();
		}
        if (tpsArray.length > 100)
            tpsArray.shift();
        averageTps = tpsArray.reduce((a, b) => a + b, 0) / tpsArray.length;    
	})

	socket.on('playerDisconnect', function (id) { // Handles player disconnection on the client side
		delete game.players[id];
	})

	// Receive level data
	socket.on('levelData', function (data) {
		game.receiveLevelData(data);
	})

	// Ping the server
	setInterval(function () {
		socket.emit('pingServer', Date.now());
	}, 100)

	// Pong the server
	socket.on('pongServer', function (t) {
		latencyArray.push(Date.now()-t);
		averageLatency = latencyArray.reduce((a, b) => a + b, 0) / latencyArray.length;
		if (latencyArray.length > 20)
            latencyArray.shift();
	})
}())