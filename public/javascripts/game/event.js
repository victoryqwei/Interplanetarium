/*

Receives events from the server

*/

import {game} from "./Game.js";

(function () {

	window.socket = io("/");

	socket.on("msg", function (msg) {
		console.log(msg);
	})

	socket.on('update', function (data) {
		game.receivePlayerData(data); // Receive and update data from other players
	})

	socket.on('playerDisconnect', function (id) { // Handles player disconnection on the client side
		delete game.players[id];
	})

	socket.on('mapData', function (data) {
		game.receiveMapData(data);
	})

}())