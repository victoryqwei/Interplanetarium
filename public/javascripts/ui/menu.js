/*

Used to manage the UI of the menu

*/

import {game} from "../game/Game.js";

(function () {

	let roomId = undefined;

	// Join / create a room
	$(window).click(function () {
		if (document.readyState != "complete")
			return;
		
		$("#title").hide();
		if (!roomId) {
			let id = window.location.pathname.replace("/", "") || randomString(7);
			console.log("Joining room with id", id);
			socket.emit("joinRoom", id);
			roomId = id;

			display.warp = true;

			// Start the game
			game.start();
		}
	})
}())