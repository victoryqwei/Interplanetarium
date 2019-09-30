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

		// Interface
		if (display.toggleInterface) {
			this.advancedKey(); // Display advanced rocket stats
			this.drawClosestPlanetHUD(); // Draw the closest planet scale on the interface
			this.drawClosestPlanetInfo(); // Draw the closest planet scale
			this.drawDashboard(); // Bottom-left indicators of vitals
			this.drawInventory(); // Draw the amount of resorces
			this.drawOptions(); // Draw the game options
			this.drawMinimap(); // Draw the space map
			this.drawServer();
			this.drawTitle();
		}
	}

	drawServer() {
		drawText("Server: " + server.id, canvas.width - 10, 20, "18px Arial", "white", "right", "middle");
		drawText("Client: " + socket.id, canvas.width - 10, 42, "18px Arial", "white", "right", "middle");
		drawText("Players: " + Object.keys(server.players).length + " / 10", canvas.width - 10, 80, "18px Arial", "white", "right", "middle");
		for (let i = 0; i < Object.keys(server.players).length; i++) {
			drawText(i+1 + ". " + Object.keys(server.players)[i], canvas.width - 10, 100 + 20*i, "18px Arial", "white", "right", "middle");
		}
	}

	drawInventory() {

		let labelSpacing = (this.HUDheight - this.HUDpadding*2)/resourceTypes.length;
		let textSize = 12*display.interfaceScale;
		let numberSize = 20*display.interfaceScale;

		let inventorySize = (this.HUDwidth/2 - this.HUDpadding*3)/2

		// RECT
		let rectOptions = {
			alpha: 0.2,
			right: this.viewPadding
		}

		// Draw minimap center (player)
		drawRoundedRect(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5, canvas.height - this.HUDheight - this.viewPadding, this.HUDwidth/2, this.HUDheight, 5, "grey", rectOptions);

		let inventoryOptions = {
			alpha: 0.2,
			outline: true,
			fill: false
		}

		// Draw the inventory slots
		drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding, canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding, inventorySize, inventorySize, "grey", inventoryOptions);
		drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding*2 + inventorySize, canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding, inventorySize, inventorySize, "grey", inventoryOptions);
		drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding, canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding*2 + inventorySize, inventorySize, inventorySize, "grey", inventoryOptions);
		drawRectangle(canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding*2 + inventorySize, canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding*2 + inventorySize, inventorySize, inventorySize, "grey", inventoryOptions);

		// Draw the resource text
		for (let i = 0; i < 2; i++) {
			drawText(resourceTypes[i].toUpperCase(),
			canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding + inventorySize/2 + inventorySize*i + this.HUDpadding*i,
			canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding*1.2,
			textSize + "px Arial", "#d1d1d1", "center", "top");
		}
		for (let i = 0; i < 2; i++) {
			drawText(resourceTypes[i+2].toUpperCase(),
			canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding + inventorySize/2 + inventorySize*i + this.HUDpadding*i,
			canvas.height - this.HUDheight - this.viewPadding + this.HUDpadding*2.2 + inventorySize,
			textSize + "px Arial", "#d1d1d1", "center", "top");
		}

		for (let i = 0; i < 2; i++) {
			drawText(abbreviateNumber(Math.floor(rocket.resources[resourceTypes[i]])),
			canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding + inventorySize/2 + inventorySize*i + this.HUDpadding*i,
			canvas.height - this.HUDheight - this.viewPadding + inventorySize/2 + this.HUDpadding,
			numberSize + "px Arial", "white", "center", "top");
		}
		for (let i = 0; i < 2; i++) {
			drawText(abbreviateNumber(Math.floor(rocket.resources[resourceTypes[i+2]])),
			canvas.width - this.HUDwidth*1.5 - this.viewPadding*1.5 + this.HUDpadding + inventorySize/2 + inventorySize*i + this.HUDpadding*i,
			canvas.height - this.HUDheight - this.viewPadding + inventorySize*1.5 + this.HUDpadding*2,
			numberSize + "px Arial", "white", "center", "top");
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
		} else {
			if (optionsToggle) {
				optionsToggle = false;
			}
		}

		// Set options visibility
		var options = document.getElementById("options-container");

		// Change visibility
		if(display.options) {
			options.style.display = "block";
		} else {
			options.style.display = "none";
		}

	}

	// Draw the minimap to display surrounding planets
	drawMinimap() {

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
		for (let i = 0; i < 5; i++) {
			let p = planets[keysSorted[i]];
			let distance = Math.max(0, round(planetDist(rocket, p)));
			drawText(
				p.name + " [" + (distance > 1000 ? round(distance / 1000, 2) + "km]" : distance + "m]"),
				canvas.width - this.HUDwidth - this.viewPadding + this.planetSize + this.HUDpadding*2,
				canvas.height - this.viewPadding - this.HUDheight + this.HUDpadding + labelSpacing*i,
				textSize + "px Arial", "white", "left", "top"
			);
		}
		for (let i = 0; i < 5; i++) {
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
		let barSize = (this.HUDwidth/2 - this.HUDpadding/2*4)/3;

		let textSize = 15*display.interfaceScale;

		let rectOptions = {
		alpha: 0.2,
		right: this.viewPadding
		}

		// Background HUD
		drawRoundedRect(this.viewPadding*1.5 + this.HUDwidth, canvas.height - this.viewPadding - this.HUDheight, this.HUDwidth/2, this.HUDheight, 5, "grey", rectOptions);

		// Fuel
		var XOffset = 50;
		var options = {
			outline: true,
			outlineWidth: 2,
			outlineColor: pSBC(-0.1, "#808080", false, true),
			fill: false,
			alpha: 0.5
		}

		// Draw fuel bar
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, -this.HUDheight + this.HUDpadding/2*2, "#808080", options);
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, (-this.HUDheight + this.HUDpadding/2*2)*Math.abs(rocket.fuel)/rocket.maxFuel, "#808080");

		// Draw fuel text
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2, canvas.height - this.viewPadding - this.HUDpadding/2);
		ctx.rotate(270 * Math.PI / 180);
		drawText("FUEL", 30*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
		ctx.closePath();
		ctx.restore();

		// Oxygen
		var yOffset = 120;
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
		drawText("OXYGEN", 40*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
		ctx.closePath();
		ctx.restore();

		// Thrust
		var yOffset = 190;
		var options = {
			outline: true,
			outlineWidth: 2,
			outlineColor: pSBC(-0.1, "#e0982b", false, true),
			fill: false,
			alpha: 0.5
		}

		// Draw thrust bar
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*3 + barSize*2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, -this.HUDheight + this.HUDpadding/2*2, "#e0982b", options);
		drawRectangle(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*3 + barSize*2,
		canvas.height - this.viewPadding - this.HUDpadding/2,
		barSize, (-this.HUDheight + this.HUDpadding/2*2)*Math.abs(rocket.thrust)/rocket.maxThrust, "#e0982b");

		// Draw thrust text
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.viewPadding*1.5 + this.HUDwidth + this.HUDpadding/2*3 + barSize*2, canvas.height - this.viewPadding - this.HUDpadding/2);
		ctx.rotate(270 * Math.PI / 180);
		drawText("THRUST", 40*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
		ctx.closePath();
		ctx.restore();
	}

	// Inform the player about the closest planet
	drawClosestPlanetInfo() {
		let rocketPos = Vector.mult(rocket.pos, display.zoom);
		var distance;
		var planetPos;

		// Cycle through planets
		for (let id in planets) {
			let p = planets[id];

			if (display.zoom < 1 && inScreen(p.pos, 1, p.radius)) { // Make sure the rocket is in space

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
				drawText(
					p.name,
					planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
					planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom - 40*display.zoom,
					60*display.zoom + "px Arial", "white", textAlign, "middle");
				if(p.name == "Black Hole") {
					drawText("Mass: UNKNOWN",
						planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
						planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom,
						30*display.zoom + "px Arial", "white", textAlign, "middle");
				} else {
					drawText("Mass: " + round(p.mass, 0) + "kg | Escape thrust: " + p.escapeThrust,
					planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
					planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom,
					30*display.zoom + "px Arial", "white", textAlign, "middle")
				}
				if(distance/1000 > 1) {
					drawText(round(distance/1000, 2) + "km",
						planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
						planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom + 40*display.zoom,
						50*display.zoom + "px Arial", "white", textAlign, "middle");
					ctx.closePath();
				} else {
					drawText(round(Math.max(distance, 0)) + "m",
						planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(p.radius)*display.zoom + textDir.x*60*display.zoom,
						planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(p.radius)*display.zoom + 40*display.zoom,
						50*display.zoom + "px Arial", "white", textAlign, "middle");
					ctx.closePath();
				}
			}
		}
	}

	// Draw closest planet on HUD
	drawClosestPlanetHUD() {

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
		drawText(rocket.closestPlanet.name,
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
