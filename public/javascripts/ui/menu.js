/*

Used to manage the UI of the menu

*/

import {game} from "../game/Game.js";
import {camera} from '../visuals/Camera.js';
import {util} from "../util/Util.js";


window.roomId = undefined;

(function () {


	function startGame() {
		if (document.readyState != "complete")
			return;
		
		$("#title").hide();
		if (!roomId && !game.map) {
			let id = window.location.pathname.replace("/", "") /*|| randomString(7)*/;
			console.log("Establishing connection to server: [" + id + "]");
			let username = window.username || ("Player" + util.randInt(1000, 9999));
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
		} else {
		   //alert("Please only use alphanumeric characters without spaces!"); 
		}
	}

	// Join / create a room
	$(document).click(function () {
		startGame();
	})

	$(window).click(function () {
		// Respawn
		let rocket = game.rocket;
		if (!rocket.alive || rocket.fuel <= 0 || rocket.integrity <= 0) {
			rocket.respawn();
		}
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

	function alphaOnly(key) {
	   return ((key >= 48 && key <= 90));
	};
}())