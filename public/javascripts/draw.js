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
		

		drawTitle(text, "Press R to respawn", true);
	}
}

function displayPlayers() {
	for (let id in server.players) {
		if (id != socket.id) {
			let p = server.players[id];

			let screenPos = getScreenPos(p.pos, display.zoom);
			
			// Draw the rocket - WITH AN ACTUAL NOSE CONE AND WINDOW YOU LITTLE
			let width = p.width * display.zoom;
			let height = p.height * display.zoom;

			// Draw body
			ctx.save();
			drawRect(screenPos.x, screenPos.y, width, height, p.angle, "#d3d3d3")
			ctx.restore();

			var options = {
				alpha: 1
			}

			// Draw nose cone
			ctx.beginPath();
			ctx.save();
			ctx.translate(screenPos.x, screenPos.y);
			ctx.rotate(p.angle);
		    ctx.moveTo(-width/2, -height/2);
		    ctx.lineTo(width/2, -height/2);
		    ctx.lineTo(0, -23*display.zoom);
		    ctx.fillStyle = "red";
		    ctx.fill();
		    ctx.restore();
		    ctx.closePath();

			// Draw rocket window
			ctx.save();
			ctx.translate(screenPos.x, screenPos.y);
			ctx.rotate(p.angle);
			drawRoundedRect(0-width/4, -width, width/2, width, 3*display.zoom, "rgb(70, 70, 70)", options)
			ctx.restore();

			// Draw thrusters
			ctx.save();
			ctx.translate(screenPos.x, screenPos.y);
			ctx.rotate(p.angle);
			drawRect(-width/2, height/2, width/2, width, 0, "red")
			ctx.restore();

			ctx.save();
			ctx.translate(screenPos.x, screenPos.y);
			ctx.rotate(p.angle);
			drawRect(width/2, height/2, width/2, width, 0, "red")
			ctx.restore();
		}	
	}
}