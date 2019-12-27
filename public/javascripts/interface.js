// Global
var advancedToggle = true;
var optionsToggle = true;

class Interface {
	constructor() {

		// TITLE
		this.titleText;
		this.descriptorText;
		this.onTitle = false;
		this.titleId;

		// HUD
		this.HUDwidth = display.HUDwidth * display.interfaceScale;
		this.HUDheight = display.HUDheight * display.interfaceScale;
		this.viewPadding = display.viewPadding * display.interfaceScale;
		this.textSpacing = display.textSpacing * display.interfaceScale;
		this.planetSize = this.HUDheight * 0.75;
		this.HUDpadding = this.HUDheight * 0.125;
	}

	drawInterface() {

		if(display.play == 0) {

			// Interface
			if (display.toggleInterface && rocket.showRocket && rocket.resources) {
				if (display.toggleHUD) { // Toggle everything that is not apart of the game
					this.advancedKey(); // Display advanced rocket stats
					this.drawClosestPlanetInfo(); // Draw the closest planet scale
					this.drawTitle(); // Draw the title screen
					this.drawPlayerName(); // Draw the players names
				}
				
				this.drawClosestPlanetHUD(); // Draw the closest planet scale on the interface
				this.drawDashboard(); // Bottom-left indicators of vitals
				this.drawInventory(); // Draw the amount of resorces
				this.drawMinimap(); // Draw the space map
			}

			this.drawOptions(); // Draw the game options
			if(display.advanced) {
				this.drawServer();
			}
		}

		if(server.players && server.id && display.spectate) {
			this.drawSpectateText();
		}
	}

	drawSpectateText() {
		drawText("Viewing: " + server.id + " (" + Object.keys(server.players).length + "/10)", canvas.width/2, canvas.height - 40, "15px Arial", "white", "center", "middle");
	}

	drawPlayerName() {
		var zoom = display.zoom;
		for (let id in server.players) {
			let player = server.players[id];
			if(id != socket.id && inScreen(player.pos, 1, 20)) {
				drawText(player.name, player.pos.x*zoom - rocket.pos.x*zoom + canvas.width/2, player.pos.y*zoom - rocket.pos.y*zoom + canvas.height/2 - 20, "18px Arial", "white", "center", "middle");
			}
		}
	}

	drawServer() {
		if (server.players) {
			drawText("Server: " + server.id, canvas.width - 10, 20, "18px Arial", "white", "right", "middle");
			drawText("Server Update Rate: " + round(server.updateRate, 1), canvas.width - 10, 42, "18px Arial", "white", "right", "middle");
			drawText("Client: " + socket.id, canvas.width - 10, 64, "18px Arial", "white", "right", "middle");
			drawText("Players: " + Object.keys(server.players).length + " / 10", canvas.width - 10, 86, "18px Arial", "white", "right", "middle");

			for (let i = 0; i < Object.keys(server.players).length; i++) {
				drawText(i+1 + ". " + Object.keys(server.players)[i], canvas.width - 10, 108 + 20*i, "18px Arial", "white", "right", "middle");
			}	
		}
		if (server.spectators) {
			drawText("Spectators: ", canvas.width - 10, 120 + 20*Object.keys(server.players).length, "18px Arial", "white", "right", "middle");
			for (let i = 0; i < Object.keys(server.spectators).length; i++) {
				drawText(i+1 + ". " + Object.keys(server.spectators)[i], canvas.width - 10, 140 + 20*i + 20*Object.keys(server.players).length, "18px Arial", "white", "right", "middle");
			}
		}
		
	}

	drawInventory() {

		let labelSpacing = (this.HUDheight - this.HUDpadding*2)/resourceTypes.length;
		let textSize = 14*display.interfaceScale;
		let titleSize = 17*display.interfaceScale;
		let numberSize = 20*display.interfaceScale;
		let barSpacing = 8*display.interfaceScale;
		let barHeight = (this.HUDheight/2 - barSpacing/2*4)/4;
		let inventorySize = (this.HUDwidth/2 - this.HUDpadding*3.8)/2

		// RECT
		let rectOptions = {
			alpha: 0.2,
			right: this.viewPadding
		}

		// Draw minimap center (player)
		drawRoundedRect(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 - this.HUDpadding/2, canvas.height - this.HUDheight - this.viewPadding, this.HUDwidth/4*2 + this.HUDpadding/2, this.HUDheight, 5, "grey", rectOptions);

		let inventoryOptions = {
			alpha: 1,
			outline: true,
			fill: false,
			outlineColor: "grey"
		}

		// Draw the inventory slots
		drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2, canvas.height - this.HUDheight - this.viewPadding*1.3 + this.HUDpadding, inventorySize, inventorySize, "grey", inventoryOptions);
		drawText("Level",
			canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2 + inventorySize/2,
			canvas.height - this.HUDheight - this.viewPadding*1.3 + this.HUDpadding + inventorySize/2.9,
			titleSize + "px Arial", "white", "center", "middle");
		drawText("1",
			canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2 + inventorySize/2,
			canvas.height - this.HUDheight - this.viewPadding*1.3 + this.HUDpadding + inventorySize/1.5,
			titleSize + "px Arial", "white", "center", "middle");

		// Draw the rocket level statistics
		let rocketStats = ["Speed", "Resistance", "Damage"];

		for (let i = 0; i < 3; i++) {
		drawText(rocketStats[i],
			canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.4 + this.HUDpadding/2 + inventorySize,
			canvas.height - this.HUDheight - this.viewPadding*(1.6-(i*0.65)) + this.HUDpadding + inventorySize/3,
			textSize + "px Arial", "white", "left", "middle");
		drawText(rocket.statistics[rocketStats[i].toLowerCase()],
			canvas.width - this.HUDwidth - this.viewPadding*2.2,
			canvas.height - this.HUDheight - this.viewPadding*(1.6-(i*0.65)) + this.HUDpadding + inventorySize/3,
			textSize + "px Arial", "white", "right", "middle");
		}

		// Draw the resource bars for leveling up
		
		let statisticRequirements = {
			Iron: 100, 
			Copper: 50, 
			Kanium: 10, 
			Lead: 20
		};

		for (let i = 0; i < 4; i++) {
			// Draw the resource progress outline
			let barOptions = {alpha: 1, outline: false, fill: true, outlineColor: "white"};
			drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2,
				canvas.height - this.HUDheight - this.viewPadding*1.3 + inventorySize + barHeight*i + barSpacing*i + this.HUDpadding*1.4,
			this.HUDwidth/2-this.viewPadding/2, barHeight, "#1D192F", barOptions);
			
			barOptions = {alpha: 1, outline: false, fill: true};

			// Draw the resource progress bar
			if(Math.floor(rocket.resources[resourceTypes[i]]) >= statisticRequirements[resourceTypes[i]]) {
				drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2,
					canvas.height - this.HUDheight - this.viewPadding*1.3 + inventorySize + barHeight*i + barSpacing*i + this.HUDpadding*1.4,
				this.HUDwidth/2-this.viewPadding/2, barHeight, "#358f38", barOptions);
			} else {
				drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2,
					canvas.height - this.HUDheight - this.viewPadding*1.3 + inventorySize + barHeight*i + barSpacing*i + this.HUDpadding*1.4,
				(this.HUDwidth/2-this.viewPadding/2)*Math.abs(rocket.resources[resourceTypes[i]])/statisticRequirements[resourceTypes[i]], barHeight, "#4d4d4d", barOptions);
			}
		
			// Draw the resource progress text
			if(Math.floor(rocket.resources[resourceTypes[i]]) >= statisticRequirements[resourceTypes[i]]) {
			drawCheckmark(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2 + (this.HUDwidth/2-this.viewPadding/2)/2,
				canvas.height - this.HUDheight - this.viewPadding*1.3 + inventorySize + barHeight*i + barSpacing*i + this.HUDpadding*1.4 + barHeight/2 - 1, 3*display.interfaceScale, 3*display.interfaceScale)
			} else {
				drawText(resourceTypes[i] + " " + Math.floor(rocket.resources[resourceTypes[i]]) + " / " + statisticRequirements[resourceTypes[i]],
					canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2 + (this.HUDwidth/2-this.viewPadding/2)/2,
					canvas.height - this.HUDheight - this.viewPadding*1.3 + inventorySize + barHeight*i + barSpacing*i + this.HUDpadding*1.4 + barHeight/2,
					textSize + "px Arial", "white", "center", "center");
			}
		
			barOptions = {alpha: 1, outline: true, fill: false, outlineColor: "white"};
		
			drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.8 + this.HUDpadding/2,
				canvas.height - this.HUDheight - this.viewPadding*1.3 + inventorySize + barHeight*i + barSpacing*i + this.HUDpadding*1.4,
			this.HUDwidth/2-this.viewPadding/2, barHeight, "#1D192F", barOptions);
		}
	}

	// Draw the games options (interface scale)
	drawOptions() {

		// Detect key input (Escape)
		if(keys[27]) {
			if(optionsToggle === false) {
				optionsToggle = true;
				display.options = !display.options;
			}
		} else { // Look at this T flip-flop
			if (optionsToggle) {
				optionsToggle = false;
			}
		}

		if(display.options) {
			display.toggleHUD = false;
		} else {
			display.toggleHUD = true;
		}

		var planetMarker = document.getElementById("planetMarker");
		

		if(planetMarker.checked) {
			display.legacyPlanetMarker = true;
			updateCookie("userMarker", true);
		} else {
			display.legacyPlanetMarker = false;
			updateCookie("userMarker", false);
		}

		var performance = document.getElementById("performance");
		

		if(performance.checked) {
			display.performanceMode = true;
			updateCookie("userPerformance", true);
		} else {
			display.performanceMode = false;
			updateCookie("userPerformance", false);
		}

		// Set options visibility
		var options = document.getElementById("settings");

		// Change visibility
		if(display.options) {
			options.style.display = "block";
		} else {
			options.style.display = "none";
		}

	}

	// Draw the minimap to display surrounding planets
	drawMinimap() {

		if (rocket.closestPlanet) {
			// HUD
			let labelSpacing = this.planetSize/4.5;

			let textSize = 16*display.interfaceScale;
			let resourceSize = 10*display.interfaceScale;

			// MAP
			let mapSize = this.planetSize;
			let mapScaleSize = 10000;
			let mapZoom = mapScaleSize / mapSize / 1.5;

			// RECT
			let rectOptions = {
				alpha: 0.2,
				right: this.viewPadding
			}

			// ARC
			let optionsCircle = {
				outline: true,
				outlineWidth: 10,
				outlineColor: rocket.closestPlanet.strokeColor,
				glow: false,
				glowColor: rocket.closestPlanet.color,
				alpha: 0.5
			}

			// Draw minimap center (player)
			drawRoundedRect(canvas.width - this.HUDwidth - this.viewPadding, canvas.height - this.HUDheight - this.viewPadding, this.HUDwidth, this.HUDheight, 5, "grey", rectOptions);

			// Draw the white map edge
			ctx.save();
			ctx.beginPath();
			ctx.lineWidth = 3;
		    ctx.strokeStyle = "white";
			ctx.arc((canvas.width - this.HUDwidth - this.viewPadding + this.HUDpadding + this.planetSize/2),
			(canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding + this.planetSize/2),
			this.planetSize/2, 0, Math.PI*2);
			ctx.stroke();
			ctx.fillStyle = "#1d2951"
			ctx.fill();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc((canvas.width - this.HUDwidth - this.viewPadding + this.HUDpadding + this.planetSize/2),
			(canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding + this.planetSize/2),
			this.planetSize/2, 0, Math.PI*2);
			ctx.fillStyle = "grey"
			ctx.globalAlpha = 0.2;
			ctx.clip();
			ctx.fill();
			ctx.closePath();

			let options = {
				fill: false,
				outline: true,
				outlineWidth: 3, 
				outlineColor: "white",
				alpha: 1
			}

			drawCircle((canvas.width - this.HUDwidth - this.viewPadding + this.HUDpadding + this.planetSize/2) + ((0 - rocket.pos.x) / mapZoom),
					(canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding + this.planetSize/2) + ((0 - rocket.pos.y) / mapZoom), server.map.mapRadius/mapZoom, "white", options);

			// Draw the planets
			for (let id in planets) {
				let p = planets[id];
				if(getDistance(p.pos.x, p.pos.y, rocket.pos.x, rocket.pos.y) < mapScaleSize/2 + p.radius) {

					drawCircle((canvas.width - this.HUDwidth - this.viewPadding + this.HUDpadding + this.planetSize/2) + ((p.pos.x - rocket.pos.x) / mapZoom),
					(canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding + this.planetSize/2) + ((p.pos.y - rocket.pos.y) / mapZoom), p.radius/mapZoom, p.color);

				}
			}

			ctx.globalAlpha = 1;

			// Draw enemy rockets
			for (let id in server.players) {

				let serverRocket = server.players[id];
				if (id != socket.id && serverRocket.interpolated) {
					serverRocket.pos = new Vector(serverRocket.interpolated.x, serverRocket.interpolated.y);
					serverRocket.angle = serverRocket.interpolated.angle;

					drawTriangle((canvas.width - this.HUDwidth - this.viewPadding + this.HUDpadding + this.planetSize/2) +  ((serverRocket.pos.x - rocket.pos.x) / mapZoom), (canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding + this.planetSize/2) +  ((serverRocket.pos.y - rocket.pos.y) / mapZoom), 4, 7, serverRocket.angle, "red");

				}
			}

			ctx.restore(); // Restore before clipping the drawing area

			// Draw rocket position on minimap
			drawTriangle((canvas.width - this.HUDwidth - this.viewPadding + this.HUDpadding + this.planetSize/2), (canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding + this.planetSize/2), 4, 7, rocket.angle, "white");

			// Sort planet list by distance
			var sortedPlanets = [];

			var keysSorted = Object.keys(planets).sort(function(a,b){
				return planetDist(rocket, planets[a])-planetDist(rocket, planets[b])
			})

			// Display List
			for (let i = 0; i < Math.min(Object.keys(server.map.planets).length, 5); i++) {
				let p = planets[keysSorted[i]];
				let distance = Math.max(0, round(planetDist(rocket, p)));
				drawText(
					p.name + " [" + (distance > 1000 ? round(distance / 1000, 2) + "km]" : distance + "m]"),
					canvas.width - this.HUDwidth - this.viewPadding + this.planetSize + this.HUDpadding*2,
					canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*i,
					textSize + "px Arial", "white", "left", "top"
				);
			}
			for (let i = 0; i < Math.min(Object.keys(server.map.planets).length, 5); i++) {
				let p = planets[keysSorted[i]];
				let distance = Math.max(0, round(planetDist(rocket, p)));
				drawText(
					p.resource.type,
					canvas.width - this.HUDwidth - this.viewPadding + this.planetSize + this.HUDpadding*2,
					canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*i - 12*display.interfaceScale,
					resourceSize + "px Arial", "grey", "left", "top"
				);
			}
		}

	}

	// Draw the advanced stats
	drawStats() {
		for (var i = 0; i < stats.length; i++) {
			let stat = stats[i];
			stat.display(i);
		}
	}

	// Draw the rocket dashboard (fuel, oxygen, thrust)
	drawDashboard() {

		// BAR
		let labelSpacing = this.planetSize/4;
		let barSize = (this.HUDwidth/2 - this.HUDpadding/2*4)/4;

		let textSize = 15*display.interfaceScale;

		let rectOptions = {
		alpha: 0.2,
		right: this.viewPadding
		}

		// Background HUD
		drawRoundedRect(this.viewPadding*1.5 + this.HUDwidth, canvas.height - this.viewPadding - this.HUDheight, this.HUDwidth/4*2 + this.HUDpadding/2, this.HUDheight, 5, "grey", rectOptions);

		// Fuel
		var options = {
			outline: true,
			outlineWidth: 2,
			outlineColor: pSBC(-0.1, "#767652", false, true),
			fill: false,
			alpha: 0.5
		}

		// Draw fuel bar
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, -this.HUDheight + this.HUDpadding/2*2, "#767652", options);
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, (-this.HUDheight + this.HUDpadding/2*2)*Math.abs(rocket.fuel)/rocket.maxFuel, "#767652");

		// Draw fuel text
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2, canvas.height - this.viewPadding - this.HUDpadding/2);
		ctx.rotate(270 * Math.PI / 180);
		drawText("FUEL", 75*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
		ctx.closePath();
		ctx.restore();

		// Oxygen
		var options = {
			outline: true,
			outlineWidth: 2,
			outlineColor: pSBC(-0.1, "#F6F5F2", false, true),
			fill: false,
			alpha: 0.5
		}

		// Draw oxygen bar
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*2 + barSize,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, -this.HUDheight + this.HUDpadding/2*2, "#F6F5F2", options);
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*2 + barSize,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, (-this.HUDheight + this.HUDpadding/2*2)*Math.abs(rocket.oxygen)/rocket.maxOxygen, "#F6F5F2");

		// Draw oxygen text
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*2 + barSize, canvas.height - this.viewPadding - this.HUDpadding/2);
		ctx.rotate(270 * Math.PI / 180);
		drawText("OXYGEN", 75*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
		ctx.closePath();
		ctx.restore();

		// Integrity
		var options = {
			outline: true,
			outlineWidth: 2,
			outlineColor: pSBC(-0.1, "#808080", false, true),
			fill: false,
			alpha: 0.5
		}

		// Draw integrity bar
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*3 + barSize*2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, -this.HUDheight + this.HUDpadding/2*2, "#808080", options);
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*3 + barSize*2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, (-this.HUDheight + this.HUDpadding/2*2)*Math.abs(rocket.integrity)/rocket.maxIntegrity, "#808080");

		// Draw integrity text
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*3 + barSize*2, canvas.height - this.viewPadding - this.HUDpadding/2);
		ctx.rotate(270 * Math.PI / 180);
		drawText("INTEGRITY", 75*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
		ctx.closePath();
		ctx.restore();

		// Thrust
		var options = {
			outline: true,
			outlineWidth: 2,
			outlineColor: pSBC(-0.1, "#e0982b", false, true),
			fill: false,
			alpha: 0.5
		}

		// Draw thrust bar
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*4 + barSize*3,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, -this.HUDheight + this.HUDpadding/2*2, "#e0982b", options);
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*4 + barSize*3,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, (-this.HUDheight + this.HUDpadding/2*2)*Math.abs(rocket.thrust)/rocket.maxThrust, "#e0982b");

		// Draw thrust text
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*4 + barSize*3, canvas.height - this.viewPadding - this.HUDpadding/2);
		ctx.rotate(270 * Math.PI / 180);
		drawText("THRUST", 75*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
		ctx.closePath();
		ctx.restore();
	}

	// Inform the player about the closest planet
	drawClosestPlanetInfo() {
		let rocketPos = Vector.mult(rocket.pos, display.zoom);
		var distance;
		var planetPos;

		// Cycle through planets

		let planetCount = 0
		for (let id in planets) {
			let p = planets[id];
			if (display.zoom < 1 && inScreen(p.pos, 1, p.radius)) { // Make sure the rocket is in space
				planetCount++
				if(display.performanceMode && planetCount == 3) {
					break
				}
				// Set planet position and distance
				planetPos = Vector.mult(p.pos, display.zoom);
				var distance = dist(p.pos, rocket.pos) - p.radius - rocket.height/2;

				// Text align
				let textDir;
				let textAlign;
				let angleFromPlanet = Math.atan2(p.pos.y-rocket.pos.y, p.pos.x-rocket.pos.x)/Math.PI*180;

				// Planet text position
				if(angleFromPlanet < 90 && angleFromPlanet >= 0) {
					textDir = new Vector(-1, -1)
					textAlign = "right";
				} else if(angleFromPlanet >= 90 && angleFromPlanet <= 180) {
					textDir = new Vector(1, -1)
					textAlign = "left";
				} else if(angleFromPlanet >= -180 && angleFromPlanet <= -90) {
					textDir = new Vector(1, 1)
					textAlign = "left";
				} else if(angleFromPlanet > -90 && angleFromPlanet <= 0) {
					textDir = new Vector(-1, 1)
					textAlign = "right";
				}

				// Draw pointer circle and lines
				drawCircle(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius/2)*display.zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius/2)*display.zoom, 15*display.zoom, "white");
				ctx.beginPath();
				ctx.strokeStyle = "white";
				ctx.lineWidth = 15*display.zoom;
				ctx.moveTo(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius/1.6)*display.zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius/1.6)*display.zoom);
				ctx.lineTo(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom);
				ctx.lineTo(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*50*display.zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom);
				ctx.stroke();
				ctx.closePath();

				// Draw descriptive text
				ctx.beginPath();

				let textColor = "white";
				if(p.danger == 1) {
					textColor = "#a60b00";
				}

				drawText(
					p.name,
					planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
					planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom - 40*display.zoom,
					60*display.zoom + "px Arial", textColor, textAlign, "middle");
				if(p.name == "Black Hole") {
					drawText("Mass: UNKNOWN",
						planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
						planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom,
						30*display.zoom + "px Arial", textColor, textAlign, "middle");
				} else {
					drawText("Mass: " + round(p.mass, 0) + "kg | " + "★".repeat(Math.ceil(round(p.danger*100, 0)/20)),
						planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
						planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom,
						30*display.zoom + "px Arial", textColor, textAlign, "middle");
				}
				if(distance/1000 > 1) {
					drawText(round(distance/1000, 2) + "km",
						planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
						planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom + 40*display.zoom,
						50*display.zoom + "px Arial", textColor, textAlign, "middle");
					ctx.closePath();
				} else {
					drawText(round(Math.max(distance, 0)) + "m",
						planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
						planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom + 40*display.zoom,
						50*display.zoom + "px Arial", textColor, textAlign, "middle");
					ctx.closePath();
				}

			}
		}
	}

	// Draw closest planet on HUD
	drawClosestPlanetHUD() {

		if (rocket.closestPlanet) {
			let labelSize = 10*display.interfaceScale;
			let titleSize = 22*display.interfaceScale;
			let textSize = 18*display.interfaceScale;

			// LABEL
			let labelSpacing = this.planetSize/4;

			// Draw background HUD
			let options = {
				alpha: 0.2,
				right: this.viewPadding
			}

			drawRoundedRect(this.viewPadding, canvas.height - this.viewPadding - this.HUDheight, this.HUDwidth, this.HUDheight, 5, "grey", options);

			// Draw planet
			let optionsCircle = {
				outline: true,
				outlineWidth: 10,
				outlineColor: rocket.closestPlanet.strokeColor,
				glow: false,
				glowColor: rocket.closestPlanet.color,
				alpha: 0.5
			}

			drawCircle(this.viewPadding + this.planetSize/2 + this.HUDpadding, canvas.height - this.viewPadding - this.HUDheight/2, this.planetSize/2, rocket.closestPlanet.color, optionsCircle); // Draw planet on HUD

			var labels = ["NAME", "RESOURCE", "MASS", "DISTANCE"];

			// Draw descriptive text
			for (let i = 0; i < 4; i++) {
				drawText(labels[i] + ":",
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*i,
				labelSize + "px Arial", "grey", "left", "top"
				);
			}

			// Draw descriptive values
			drawText(rocket.closestPlanet.name + " " + "★".repeat(Math.ceil(round(rocket.closestPlanet.danger*100, 0)/20)),
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + this.textSpacing,
				titleSize + "px Arial", "white", "left", "top"
			);
			if (rocket.closestPlanet.resource.type == "None") {
				drawText("None",
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing + this.textSpacing,
				textSize + "px Arial", "white", "left", "top"
				);
			} else {
				drawText(rocket.closestPlanet.resource.type + ": " + round((rocket.closestPlanet.resource.amount/rocket.closestPlanet.resource.totalAmount)*100, 1) + "%",
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing + this.textSpacing,
				textSize + "px Arial", "white", "left", "top"
				);
			}
			if(rocket.closestPlanet.name == "Black Hole") {
				drawText("UNKNOWN",
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*2 + this.textSpacing,
				textSize + "px Arial", "white", "left", "top"
				);
			} else {
				drawText(round(rocket.closestPlanet.mass, 0) + "kg",
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*2 + this.textSpacing,
				textSize + "px Arial", "white", "left", "top"
				);
			}
			if(rocket.closestPlanetDistance/1000 > 1) {
				drawText(round(rocket.closestPlanetDistance/1000, 2) + "km",
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*3 + this.textSpacing,
				textSize + "px Arial", "white", "left", "top"
				);
			} else {
				drawText(round(rocket.closestPlanetDistance, 0) + "m",
				this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*3 + this.textSpacing,
				textSize + "px Arial", "white", "left", "top"
				);
			}
		}

	}

	// Key to toggle advanced stats
	advancedKey() {

		// Advanced view toggle
		if(keys[192]) {
			if(advancedToggle === false) {
				advancedToggle = true;
				display.advanced = !display.advanced;
			}
		} else {
			if (advancedToggle) {
				advancedToggle = false;
			}
		}
	}

	// Animated title timer
	animateTitle(title, descriptor, time, callbackFunction) {

		// Set title variables
		this.titleText = title;
		this.descriptorText = descriptor;

		this.onTitle = true;

		// Set title timeout
		setTimeout(function() {
			callbackFunction();
		}, time);
	}



	// Draw the center title
	drawTitle(title, descriptor, ignoreTimeout) {

		// TITLE
		let titleOptions = {
			font: "80px Arial",
			color: "white",
			align: "center",
			baseline: "middle"
		}

		// SUBTITLE
		let options = {
			font: "20px Arial",
			color: "white",
			align: "center",
			baseline: "middle"
		}

		// If drawing title
		if(this.onTitle) {
			//console.log(this.onTitle)
			ctx.beginPath();
			drawText(this.titleText, canvas.width/2, canvas.height/5, titleOptions);
			drawText(this.descriptorText, canvas.width/2, canvas.height/5 + 50, options);
			ctx.closePath();
		}

		// Overwrite the time out title
		if (ignoreTimeout) {
			this.onTitle = false;
			ctx.beginPath();
			drawText(title, canvas.width/2, canvas.height/5, titleOptions);
			drawText(descriptor, canvas.width/2, canvas.height/5 + 50, options);
			ctx.closePath();
		}
	}

}
