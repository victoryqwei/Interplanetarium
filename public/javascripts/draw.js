function drawMenu() {
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
}

function drawStats() {
	for (var i = 0; i < stats.length; i++) {
		let stat = stats[i];
		stat.display(i);
	}
}

function drawSpace() {
	let color = "#1d2951";
	if (rocket.crashed || rocket.fuel <= 0 || rocket.oxygen <= 0)
		color = pSBC(0.1, "#1d2951", "#ff0000");
	drawRect(rocket.pos.x, rocket.pos.y, canvas.width, canvas.height, 0, color);
}

function drawRespawn() {
	if (rocket.crashed || rocket.fuel <= 0 || rocket.oxygen <= 0) {
		let text;
		if (rocket.oxygen <= 0)
			text = "You ran out of oxygen!";
		else if (rocket.fuel <= 0)
			text = "You ran out of fuel!";
		else if (rocket.speed >= rocket.landingSpeed)
			text = "You crashed!";
		else if (rocket.goodLanding === false)
			text = "You flipped over!";


		ui.drawTitle(text, "Press R to respawn", true);
	}
}

// Display other players
function displayPlayers() {
	for (let id in server.players) {
		let serverRocket = server.players[id];
		if (id != socket.id && serverRocket.interpolated && inScreen(serverRocket.interpolated, 1, 20)) {
			serverRocket.pos = new Vector(serverRocket.interpolated.x, serverRocket.interpolated.y);
			serverRocket.angle = serverRocket.interpolated.angle;

			Rocket.display(serverRocket, true, true);
		}
	}
}
