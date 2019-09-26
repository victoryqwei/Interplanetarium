// Global
var titleText;
var titleId;
var descriptorText;
var onTitle = false;
var advancedToggle = true;
var optionsToggle = true;

// Use function to call functions (yo dawg)
function drawInterface() {

	// Interface
	if (display.toggleInterface) {
		drawTitle(); // Draw the display title text
		advancedKey(); // Display advanced rocket stats
		drawClosestPlanetHUD(); // Draw the closest planet scale on the interface
		drawClosestPlanetInfo(); // Draw the closest planet scale 
		drawDashboard(); // Bottom-left indicators of vitals
		drawInventory(); // Draw the amount of resorces		
		drawOptions(); // Draw the game options
		drawMinimap(); // Draw the space map
	}
}

function drawInventory() {

	let HUDwidth = display.HUDwidth * display.interfaceScale;
	let HUDheight = display.HUDheight * display.interfaceScale;
	let viewPadding = display.viewPadding * display.interfaceScale;
	let textSpacing = display.textSpacing * display.interfaceScale;

	let planetSize = HUDheight * 0.75;
	let HUDpadding = HUDheight * 0.125;
	let labelSpacing = (HUDheight - HUDpadding*2)/resourceTypes.length;
	let textSize = 12*display.interfaceScale;
	let numberSize = 20*display.interfaceScale;

	let inventorySize = (HUDwidth/2 - HUDpadding*3)/2

	// RECT
	let rectOptions = {
		alpha: 0.2,
		right: viewPadding
	}

	// Draw minimap center (player)
	drawRoundedRect(canvas.width - HUDwidth*1.5 - viewPadding*1.5, canvas.height - HUDheight - viewPadding, HUDwidth/2, HUDheight, 5, "grey", rectOptions);

	let inventoryOptions = {
		alpha: 0.2,
		outline: true,
		fill: false
	}

	// Draw the inventory slots
	drawRectangle(canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding, canvas.height - HUDheight - viewPadding + HUDpadding, inventorySize, inventorySize, "grey", inventoryOptions);
	drawRectangle(canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding*2 + inventorySize, canvas.height - HUDheight - viewPadding + HUDpadding, inventorySize, inventorySize, "grey", inventoryOptions);
	drawRectangle(canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding, canvas.height - HUDheight - viewPadding + HUDpadding*2 + inventorySize, inventorySize, inventorySize, "grey", inventoryOptions);
	drawRectangle(canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding*2 + inventorySize, canvas.height - HUDheight - viewPadding + HUDpadding*2 + inventorySize, inventorySize, inventorySize, "grey", inventoryOptions);

	// Draw the resource text
	for (let i = 0; i < 2; i++) {
		drawText(resourceTypes[i].toUpperCase(), 
		canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding + inventorySize/2 + inventorySize*i + HUDpadding*i, 
		canvas.height - HUDheight - viewPadding + HUDpadding*1.2,
		textSize + "px Arial", "#d1d1d1", "center", "top");
	}
	for (let i = 0; i < 2; i++) {
		drawText(resourceTypes[i+2].toUpperCase(), 
		canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding + inventorySize/2 + inventorySize*i + HUDpadding*i, 
		canvas.height - HUDheight - viewPadding + HUDpadding*2.2 + inventorySize,
		textSize + "px Arial", "#d1d1d1", "center", "top");
	}

	for (let i = 0; i < 2; i++) {
		drawText(abbreviateNumber(Math.floor(rocket.resources[resourceTypes[i]])), 
		canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding + inventorySize/2 + inventorySize*i + HUDpadding*i, 
		canvas.height - HUDheight - viewPadding + inventorySize/2 + HUDpadding,
		numberSize + "px Arial", "white", "center", "top");
	}
	for (let i = 0; i < 2; i++) {
		drawText(abbreviateNumber(Math.floor(rocket.resources[resourceTypes[i+2]])), 
		canvas.width - HUDwidth*1.5 - viewPadding*1.5 + HUDpadding + inventorySize/2 + inventorySize*i + HUDpadding*i, 
		canvas.height - HUDheight - viewPadding + inventorySize*1.5 + HUDpadding*2,
		numberSize + "px Arial", "white", "center", "top");
	}
}

// Draw the games options (interface scale)
function drawOptions() {

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
function drawMinimap() {

	// HUD
	let HUDwidth = display.HUDwidth * display.interfaceScale;
	let HUDheight = display.HUDheight * display.interfaceScale;
	let viewPadding = display.viewPadding * display.interfaceScale;
	let textSpacing = display.textSpacing * display.interfaceScale;

	let planetSize = HUDheight * 0.75;
	let HUDpadding = HUDheight * 0.125;
	let labelSpacing = planetSize/4.5;

	let textSize = 16*display.interfaceScale;
	let resourceSize = 10*display.interfaceScale;

	// MAP
	let zoom = display.zoom;
	let mapSize = planetSize;
	let mapScaleSize = 10000;
	let mapZoom = mapScaleSize / mapSize / 1.5;

	// RECT
	let rectOptions = {
		alpha: 0.2,
		right: viewPadding
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
	drawRoundedRect(canvas.width - HUDwidth - viewPadding, canvas.height - HUDheight - viewPadding, HUDwidth, HUDheight, 5, "grey", rectOptions);

	// Draw the white map edge
	ctx.save();
	ctx.beginPath();
	ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
	ctx.arc((canvas.width - HUDwidth - viewPadding + HUDpadding + planetSize/2), 
	(canvas.height - HUDheight - viewPadding + HUDpadding + planetSize/2),
	 planetSize/2, 0, Math.PI*2);
	ctx.stroke();
	ctx.fillStyle = "#1d2951"
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc((canvas.width - HUDwidth - viewPadding + HUDpadding + planetSize/2), 
	(canvas.height - HUDheight - viewPadding + HUDpadding + planetSize/2),
	 planetSize/2, 0, Math.PI*2);
	ctx.fillStyle = "grey"
	ctx.globalAlpha = 0.2;
	ctx.clip();
	ctx.fill();
	ctx.closePath();
	
	// Draw the planets
	for (var i = 0; i < planets.length; i++) {
		if(getDistance(planets[i].pos.x, planets[i].pos.y, rocket.pos.x, rocket.pos.y) < mapScaleSize/2 + planets[i].radius) {
			
			drawCircle((canvas.width - HUDwidth - viewPadding + HUDpadding + planetSize/2) + ((planets[i].pos.x - rocket.pos.x) / mapZoom),
			(canvas.height - HUDheight - viewPadding + HUDpadding + planetSize/2) + ((planets[i].pos.y - rocket.pos.y) / mapZoom), planets[i].radius/mapZoom, planets[i].color);

		}
	}

	ctx.restore(); // Restore before clipping the drawing area

	// Draw rocket position on minimap
	drawTriangle((canvas.width - HUDwidth - viewPadding + HUDpadding + planetSize/2), (canvas.height - HUDheight - viewPadding + HUDpadding + planetSize/2), 4, 7, rocket.angle, "white");

	// Sort planet list by distance
	var sortedPlanetList = [];
	var planetList = [].concat(planets);
	for (var i = 0; i < 5; i++) {
		var selectPlanet = undefined;
		var distance = Infinity;
		for (var j = 0; j < planetList.length; j++) {
			if(planetDist(rocket, planetList[j]) < distance) {
				distance = dist(planetList[j].pos, rocket.pos) - planetList[j].radius - rocket.height/2;
				selectPlanet = j;
			}
		}

		sortedPlanetList.push(planetList[selectPlanet]);
		planetList.splice(selectPlanet, 1);
	}

	// Display List - OPTIMIZE FOR LATER
	for (let i = 0; i < 5; i++) {
		let distance = Math.max(0, round(planetDist(rocket, sortedPlanetList[i])));
		drawText(
			sortedPlanetList[i].name + " [" + (distance > 1000 ? round(distance / 1000, 2) + "km]" : distance + "m]"), 
			canvas.width - HUDwidth - viewPadding + planetSize + HUDpadding*2,
			canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing*i, 
			textSize + "px Arial", "white", "left", "top"
		);
	}
	for (let i = 0; i < 5; i++) {
		let distance = Math.max(0, round(planetDist(rocket, sortedPlanetList[i])));
		drawText(
			sortedPlanetList[i].resource.type, 
			canvas.width - HUDwidth - viewPadding + planetSize + HUDpadding*2,
			canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing*i - 12*display.interfaceScale, 
			resourceSize + "px Arial", "grey", "left", "top"
		);
	}
}

// Draw the advanced stats
function drawStats() {
	for (var i = 0; i < stats.length; i++) {
		let stat = stats[i];
		stat.display(i);
	}
}

// Draw the rocket dashboard (fuel, oxygen, thrust)
function drawDashboard() {

	// HUD
	let HUDwidth = display.HUDwidth * display.interfaceScale;
	let HUDheight = display.HUDheight * display.interfaceScale;
	let viewPadding = display.viewPadding * display.interfaceScale;
	let textSpacing = display.textSpacing * display.interfaceScale;

	// BAR
	let planetSize = HUDheight * 0.75;
	let HUDpadding = HUDheight * 0.06;
	let labelSpacing = planetSize/4;
	let barSize = (HUDwidth/2 - HUDpadding*4)/3;

	let textSize = 15*display.interfaceScale;

	let rectOptions = {
	alpha: 0.2,
	right: viewPadding
	}
	
	// Background HUD
	drawRoundedRect(viewPadding*1.5 + HUDwidth, canvas.height - viewPadding - HUDheight, HUDwidth/2, HUDheight, 5, "grey", rectOptions);

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
	drawRectangle(viewPadding*1.5 + HUDwidth + HUDpadding, 
	canvas.height - viewPadding - HUDpadding, 
	barSize, -HUDheight + HUDpadding*2, "#808080", options);
	drawRectangle(viewPadding*1.5 + HUDwidth + HUDpadding, 
	canvas.height - viewPadding - HUDpadding, 
	barSize, (-HUDheight + HUDpadding*2)*Math.abs(rocket.fuel)/rocket.maxFuel, "#808080");

	// Draw fuel text
	ctx.save();
	ctx.beginPath();
	ctx.translate(viewPadding*1.5 + HUDwidth + HUDpadding, canvas.height - viewPadding - HUDpadding);
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
	drawRectangle(viewPadding*1.5 + HUDwidth + HUDpadding*2 + barSize, 
	canvas.height - viewPadding - HUDpadding, 
	barSize, -HUDheight + HUDpadding*2, "#F6F5F2", options);
	drawRectangle(viewPadding*1.5 + HUDwidth + HUDpadding*2 + barSize, 
	canvas.height - viewPadding - HUDpadding, 
	barSize, (-HUDheight + HUDpadding*2)*Math.abs(rocket.oxygen)/rocket.maxOxygen, "#F6F5F2");

	// Draw oxygen text
	ctx.save();
	ctx.beginPath();
	ctx.translate(viewPadding*1.5 + HUDwidth + HUDpadding*2 + barSize, canvas.height - viewPadding - HUDpadding);
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
	drawRectangle(viewPadding*1.5 + HUDwidth + HUDpadding*3 + barSize*2, 
	canvas.height - viewPadding - HUDpadding, 
	barSize, -HUDheight + HUDpadding*2, "#e0982b", options);
	drawRectangle(viewPadding*1.5 + HUDwidth + HUDpadding*3 + barSize*2, 
	canvas.height - viewPadding - HUDpadding, 
	barSize, (-HUDheight + HUDpadding*2)*Math.abs(rocket.thrust)/rocket.maxThrust, "#e0982b");

	// Draw thrust text
	ctx.save();
	ctx.beginPath();
	ctx.translate(viewPadding*1.5 + HUDwidth + HUDpadding*3 + barSize*2, canvas.height - viewPadding - HUDpadding);
	ctx.rotate(270 * Math.PI / 180);
	drawText("THRUST", 40*display.interfaceScale, barSize/2, textSize + "px Arial", "#292929", "center", "middle");
	ctx.closePath();
	ctx.restore();
}

// Inform the player about the closest planet
function drawClosestPlanetInfo() {
	let zoom = display.zoom;
	let rocketPos = Vector.mult(rocket.pos, zoom);
	var distance;
	var planetPos;

	// Cycle through planets
	for (var i = 0; i < planets.length; i++) {
		if (zoom < 1 && inScreen(planets[i].pos, 1, planets[i].radius)) { // Make sure the rocket is in space

			// Set planet position and distance 
			planetPos = Vector.mult(planets[i].pos, zoom);
			var distance = dist(planets[i].pos, rocket.pos) - planets[i].radius - rocket.height/2;

			// Text align
			let textDir;
			let textAlign;
			let angleFromPlanet = Math.atan2(planets[i].pos.y-rocket.pos.y, planets[i].pos.x-rocket.pos.x)/Math.PI*180;

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
			drawCircle(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius/2)*zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius/2)*zoom, 15*zoom, "white");
			ctx.beginPath();
			ctx.strokeStyle = "white";
			ctx.lineWidth = 15*zoom;
			ctx.moveTo(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius/1.6)*zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius/1.6)*zoom);
			ctx.lineTo(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius)*zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius)*zoom);
			ctx.lineTo(planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius)*zoom + textDir.x*50*zoom, planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius)*zoom);
			ctx.stroke();
			ctx.closePath();

			// Draw descriptive text
			ctx.beginPath();
			drawText(
				planets[i].name, 
				planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius)*zoom + textDir.x*60*zoom, 
				planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius)*zoom - 40*zoom, 
				60*zoom + "px Arial", "white", textAlign, "middle");
			if(planets[i].name == "Black Hole") {
				drawText("Mass: UNKNOWN", 
					planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius)*zoom + textDir.x*60*zoom, 
					planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius)*zoom, 
					30*zoom + "px Arial", "white", textAlign, "middle");
			} else {
				drawText("Mass: " + round(planets[i].mass, 0) + "kg | Escape thrust: " + planets[i].escapeThrust, 
				planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius)*zoom + textDir.x*60*zoom, 
				planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius)*zoom, 
				30*zoom + "px Arial", "white", textAlign, "middle")
			}
			if(distance/1000 > 1) {
				drawText(round(distance/1000, 2) + "km", 
					planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius)*zoom + textDir.x*60*zoom, 
					planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius)*zoom + 40*zoom, 
					50*zoom + "px Arial", "white", textAlign, "middle");
				ctx.closePath();	
			} else {
				drawText(round(Math.max(distance, 0)) + "m", 
					planetPos.x - rocketPos.x + canvas.width/2 + textDir.x*(planets[i].radius)*zoom + textDir.x*60*zoom, 
					planetPos.y - rocketPos.y + canvas.height/2 + textDir.y*(planets[i].radius)*zoom + 40*zoom, 
					50*zoom + "px Arial", "white", textAlign, "middle");
				ctx.closePath();	
			}	
		}
	}
}

// Draw closest planet on HUD
function drawClosestPlanetHUD() {

	// HUD
	let HUDwidth = display.HUDwidth * display.interfaceScale;
	let HUDheight = display.HUDheight * display.interfaceScale;
	let viewPadding = display.viewPadding * display.interfaceScale;
	let textSpacing = display.textSpacing * display.interfaceScale;

	let labelSize = 10*display.interfaceScale;
	let titleSize = 22*display.interfaceScale;
	let textSize = 18*display.interfaceScale;

	// LABEL
	let planetSize = HUDheight * 0.75;
	let HUDpadding = HUDheight * 0.125;
	let labelSpacing = planetSize/4;

	// Draw background HUD
	let options = {
		alpha: 0.2,
		right: viewPadding
	}
	
	drawRoundedRect(viewPadding, canvas.height - viewPadding - HUDheight, HUDwidth, HUDheight, 5, "grey", options);

	// Draw planet
	let optionsCircle = {
		outline: true,
		outlineWidth: 10,
		outlineColor: rocket.closestPlanet.strokeColor, 
		glow: false,
		glowColor: rocket.closestPlanet.color,
		alpha: 0.5
	}

	drawCircle(viewPadding + planetSize/2 + HUDpadding, canvas.height - viewPadding - HUDheight/2, planetSize/2, rocket.closestPlanet.color, optionsCircle); // Draw planet on HUD

	labels = ["NAME", "RESOURCE", "MASS", "DISTANCE"];

	// Draw descriptive text
	for (let i = 0; i < 4; i++) {
		drawText(labels[i] + ":", 
		viewPadding + planetSize + HUDpadding*2,
		canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing*i, 
		labelSize + "px Arial", "grey", "left", "top"
		);
	}

	// Draw descriptive values
	drawText(rocket.closestPlanet.name, 
		viewPadding + planetSize + HUDpadding*2, 
		canvas.height - viewPadding - HUDheight + HUDpadding + textSpacing,
		titleSize + "px Arial", "white", "left", "top"
	);
	if (rocket.closestPlanet.resource.type == "None") {
		drawText("None", 
		viewPadding + planetSize + HUDpadding*2, 
		canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing + textSpacing,
		textSize + "px Arial", "white", "left", "top"
		);
	} else {
		drawText(rocket.closestPlanet.resource.type + ": " + round((rocket.closestPlanet.resource.amount/rocket.closestPlanet.resource.totalAmount)*100, 1) + "%", 
		viewPadding + planetSize + HUDpadding*2, 
		canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing + textSpacing,
		textSize + "px Arial", "white", "left", "top"
		);
	}
	if(rocket.closestPlanet.name == "Black Hole") {
		drawText("UNKNOWN", 
		viewPadding + planetSize + HUDpadding*2, 
		canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing*2 + textSpacing,
		textSize + "px Arial", "white", "left", "top"
		);
	} else {
		drawText(round(rocket.closestPlanet.mass, 0) + "kg", 
		viewPadding + planetSize + HUDpadding*2, 
		canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing*2 + textSpacing,
		textSize + "px Arial", "white", "left", "top"
		);
	}
	if(rocket.closestPlanetDistance/1000 > 1) {
		drawText(round(rocket.closestPlanetDistance/1000, 2) + "km", 
		viewPadding + planetSize + HUDpadding*2, 
		canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing*3 + textSpacing,
		textSize + "px Arial", "white", "left", "top"
		);
	} else {
		drawText(round(rocket.closestPlanetDistance, 0) + "m", 
		viewPadding + planetSize + HUDpadding*2, 
		canvas.height - viewPadding - HUDheight + HUDpadding + labelSpacing*3 + textSpacing,
		textSize + "px Arial", "white", "left", "top"
		);
	}
}

// Key to toggle advanced stats
function advancedKey() {

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

// Draw the center title 
function drawTitle(title, descriptor, ignoreTimeout) {

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
		if(onTitle) {
			ctx.beginPath();
			drawText(titleText, canvas.width/2, canvas.height/5, titleOptions);
			drawText(descriptorText, canvas.width/2, canvas.height/5 + 50, options);
			ctx.closePath();
		}

		// Overwrite the time out title
		if (ignoreTimeout) {			
			onTitle = false;
			ctx.beginPath();
			drawText(title, canvas.width/2, canvas.height/5, titleOptions);
			drawText(descriptor, canvas.width/2, canvas.height/5 + 50, options);
			ctx.closePath();
		}
	}

// Animated title timer
function animateTitle(title, descriptor, time) {

	// Set title variables
	titleText = title;
	descriptorText = descriptor;

	// Set title timeout
	if (time > 0) {
		titleId = setTimeout(function() {
			onTitle = false;
		}, time);
	}
	onTitle = true;
}