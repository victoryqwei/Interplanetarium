/*function drawMenu() {
	if (display.toggleMenu) {
		// TITLE
		let titleOptions = {
			font: "100px Arial",
			color: "white",
			align: "center",
			baseline: "middle"
		}

		drawText("INTERPLANETARIUM", canvas.width/2, canvas.height/3, titleOptions);

		drawImage(images.wasd, canvas.width/2, canvas.height*3/4, canvas.width/8, canvas.width/16);
		drawText("Hold up or W to add thrust", canvas.width/2, canvas.height*3/4+canvas.width/16, "20px Arial", "white")
	}

	// Toggle display
	if (keys[38] || keys[87]) {
		display.toggleInterface = true;
		display.toggleMenu = false;
	}
}*/

function drawStats() {
	for (var i = 0; i < stats.length; i++) {
		let stat = stats[i];
		stat.display(i);
	}
}

function drawSpace() {
	
	// Draw normally after server loads
	if (server.map && server.map.mapRadius) {
		
		drawRect(rocket.pos.x, rocket.pos.y, canvas.width, canvas.height, 0, "#000000");
		var screenPos = getScreenPos(new Vector(), display.zoom);

		let color = "#1d2951";
		if (rocket.crashed || rocket.fuel <= 0 || rocket.oxygen <= 0 || rocket.integrity <= 0)
		color = pSBC(0.1, "#1d2951", "#ff0000");
		drawCircle(screenPos.x, screenPos.y, server.map.mapRadius*display.zoom, color);
	} else { // Draw before server loads (Remove this once we have main menu)
		drawRect(rocket.pos.x, rocket.pos.y, canvas.width, canvas.height, 0, "#1d2951");
	}

	var screenPos = getScreenPos(new Vector(), display.zoom);

	let mapRadius = 0;
	if (server.map && server.map.mapRadius) {
		mapRadius = server.map.mapRadius;
	} else {
		mapRadius = 10000;
	}
}

function drawRespawn() {
	if (rocket.crashed || rocket.fuel <= 0 || rocket.oxygen <= 0 || rocket.integrity <= 0) {
		let text;
		if (rocket.oxygen <= 0)
			text = "You ran out of oxygen!";
		else if (rocket.fuel <= 0)
			text = "You ran out of fuel!";
		else if (rocket.speed >= rocket.landingSpeed)
			text = "You crashed!";
		else if (rocket.goodLanding === false)
			text = "You flipped over!";
		else if (rocket.integrity <= 0) {
			text = "Your rocket got destroyed!"
		}


		ui.drawTitle(text, "Press R to respawn", true);
	}
}

// Display other players
function displayPlayers() {
	for (let id in server.players) {
		let serverRocket = server.players[id];
		if (id != socket.id && serverRocket.interpolated && inScreen(serverRocket.pos, 1, 20)) {
			serverRocket.pos = new Vector(serverRocket.interpolated.x, serverRocket.interpolated.y);
			serverRocket.prevPos = new Vector(serverRocket.interpolatedPrev.x, serverRocket.interpolatedPrev.y);
			serverRocket.angle = serverRocket.interpolated.angle;

			Rocket.addParticles(serverRocket);
			Rocket.display(serverRocket, true, true);
		}
	}
}
