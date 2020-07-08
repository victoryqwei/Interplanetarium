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
		if (!roomId && !game.map) {
			let id = window.location.pathname.replace("/", "") /*|| randomString(7)*/;
			console.log("Joining room with id", id);
			let username = $("#username").val() || ("Player" + util.randInt(1000, 9999));
			socket.emit("joinRoom", {
				id: id,
				name: username
			});

			game.rocket.name = username;

			roomId = id;
			camera.warp = true;

			setCookie();

			// Start the game
			game.start();
		}

		// Respawn
		let rocket = game.rocket;
		if (!rocket.alive || rocket.fuel <= 0 || rocket.integrity <= 0) {
			rocket.respawn();
		}
	}

	function setCookie() {

		// Name cookie
		let userName = $("#username").val();
		let alphanumeric = /^[0-9a-zA-Z]+$/;

		// Make sure name is alphanumeric
		if(($("#username").val()).match(alphanumeric)) {
		 	if(util.getCookie('userName') == "") {

		 		// Create cookie
				console.log('Created name cookie with value: ' + JSON.stringify(userName))
				let cname = 'userName';
				let cvalue = JSON.stringify(userName);
				let exdays = 365;
				util.setCookie(cname,cvalue,exdays);
			}
			if(JSON.stringify($("#name").val()) != util.getCookie('userName')) {

				// Delete cookie
				console.log('Deleted name cookie with value: ' + util.getCookie('userName'));
				util.deleteCookie('userName');
				console.log('Created name cookie with value: ' + JSON.stringify(userName));
				let cname = 'userName';
				let cvalue = JSON.stringify(userName);
				let exdays = 365;
				util.setCookie(cname,cvalue,exdays);
			}
		} else {
		   //alert("Please only use alphanumeric characters without spaces!"); 
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