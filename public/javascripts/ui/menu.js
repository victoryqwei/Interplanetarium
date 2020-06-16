/*

Used to manage the UI of the menu

*/

import {game} from "../game/Game.js";

(function () {

	let roomId = undefined;

	function startGame() {
		if (document.readyState != "complete")
			return;
		
		$("#title").hide();
		if (!roomId) {
			let id = window.location.pathname.replace("/", "") || randomString(7);
			console.log("Joining room with id", id);
			let username = $("#username").val() || ("Player" + randInt(1000, 9999));
			socket.emit("joinRoom", {
				id: id,
				name: username
			});

			game.rocket.name = username;

			roomId = id;
			display.warp = true;

			// Start the game
			game.start();
		}
	}

	// Join / create a room
	$(window).click(function () {
		startGame();
	})

	$("#username").on('keyup', function(e) {
		if (e.keyCode == 13) {
			startGame();
		}
	})
}())