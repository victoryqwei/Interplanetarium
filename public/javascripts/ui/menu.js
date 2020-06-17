/*

Used to manage the UI of the menu

*/

import {game} from "../game/Game.js";
import {camera} from '../visuals/Camera.js';
import {util} from "../util/Util.js";

(function () {

	let roomId = undefined;

	function startGame() {
		if (document.readyState != "complete")
			return;
		
		$("#title").hide();
		if (!roomId) {
			let id = window.location.pathname.replace("/", "") || randomString(7);
			console.log("Joining room with id", id);
			let username = $("#username").val() || ("Player" + util.randInt(1000, 9999));
			socket.emit("joinRoom", {
				id: id,
				name: username
			});

			game.rocket.name = username;

			roomId = id;
			camera.warp = true;

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