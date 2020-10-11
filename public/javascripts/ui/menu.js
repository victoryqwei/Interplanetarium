/*

Used to manage the UI of the menu

*/

import {game} from "../game/Game.js";
import {camera} from '../visuals/Camera.js';
import {util} from "../util/Util.js";


window.roomId = undefined;

(function () {

	// Start the game
	function startGame() {
		// Make sure page has loaded
		if (document.readyState != "complete")
			return;

		// Emit to server
		if (!roomId && !game.map) {
			let id = window.location.pathname.replace("/", "");
			console.log("Establishing connection to server: [" + id + "]");
			let username = window.username;

			// Emit
			socket.emit("joinRoom", {
				id: id,
				name: username
			});

			// Set username
			game.rocket.name = username;
			roomId = id;
			camera.warp = true;

			// Set cookies
			setCookie();

			// Start the game
			game.start();
		}
	}

	function setCookie() {

		// Name cookie
		let userName = window.username;
		let alphanumeric = /^[0-9a-zA-Z]+$/;

		// Make sure name is alphanumeric
		if((window.username).match(alphanumeric)) {
		 	if(util.getCookie('userName') == "") {

		 		// Create cookie
				let cname = 'userName';
				let cvalue = JSON.stringify(userName);
				let exdays = 365;
				util.setCookie(cname,cvalue,exdays);
			}
			if(JSON.stringify($("#name").val()) != util.getCookie('userName')) {

				// Delete cookie
				util.deleteCookie('userName');
				let cname = 'userName';
				let cvalue = JSON.stringify(userName);
				let exdays = 365;
				util.setCookie(cname,cvalue,exdays);
			}
		}
	}

	// Join / create a room
	$(document).click(function () {
		startGame();
	})

	// Start game
	$(document).on('keyup', function(e) {
		if (e.keyCode == 13) {
			startGame();
		}
	})

	// Key input
	$(document).on('keydown', function(e) {
		let alphanumeric = /^[0-9a-zA-Z]+$/
		if(game.state == "menu") {
			if(e.keyCode == 8) {
				window.username = window.username.substring(0, window.username.length-1)
			} else {
				if (alphaOnly(e.keyCode) && window.username.length < 15) {
					window.username = window.username + e.originalEvent.key;
				}
			}
		}
	})

	// Make sure username is only alphanumaric
	function alphaOnly(key) {
	   return ((key >= 48 && key <= 90));
	};
}())