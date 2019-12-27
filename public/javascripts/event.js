// Initialize game and replace if server restarts
socket.on('init', function (serverData) {
	// Reset data
	planets = {};

	// Add server data
	server = serverData;
	for (let id in serverData.map.planets) {
		let p = serverData.map.planets[id];

		planets[id] = new Planet(p.pos.x, p.pos.y, p.mass, p.radius, p.type, p.name, p.color, p.strokeColor, p.resource, p.id);
	}

	console.log("Successfully connected to the server!\nClient ID: " + socket.id + "\nServer ID: " + server.id);
	$("#playControls").show();
});

var server = {};
var serverUpdateRate = 5;
let prev = Date.now();

socket.on('update', function (serverData) {
	// Update update rate
	server.updateRate = serverData.updateRate;

	// Update spectator / player list
	server.spectators = serverData.spectators;

	// Update map
	let map = serverData.map;

	for (let id in map.planets) {
		let p = map.planets[id];

		if (planets[id].name != "Earth") {
			planets[id].resource.amount = p.resource.amount;
			planets[id].radius = planets[id].maxRadius * (planets[id].resource.amount/planets[id].resource.totalAmount);
			planets[id].mass = planets[id].maxMass * (Math.pow(planets[id].radius, 2)/Math.pow(planets[id].maxRadius, 2));
			planets[id].color = pSBC(-(1-(planets[id].resource.amount/planets[id].resource.totalAmount)), planets[id].maxColor, false, true)
			planets[id].strokeColor = pSBC(-(1-(planets[id].resource.amount/planets[id].resource.totalAmount)), planets[id].maxStrokeColor, false, true);
			planets[id].danger = p.danger;

			planets[id].turrets = p.turrets;
			planets[id].bases = p.bases;
		}
	}

	// Update and interpolate player data
	let players = server.players;
	let newPlayers = serverData.players;

	for (let id in newPlayers) {
		if (id != socket.id && players[id]) { // Check if player exists in client and not itself
			// Save interpolated data;
			let interpolated = players[id].interpolated;
			let interpolatedPrev = players[id].interpolatedPrev;

			if (!interpolated) {
				players[id].interpolated = Ola({x: 0, y: 0, angle: 0}, 1000/serverUpdateRate);
				interpolated = players[id].interpolated;
			}

			if (!interpolatedPrev) {
				players[id].interpolatedPrev = Ola({x: 0, y: 0, angle: 0}, 1000/serverUpdateRate);
				interpolatedPrev = players[id].interpolatedPrev;
			}

			let particles = players[id].particles;

			// Update new data
			players[id] = newPlayers[id];

			// Restore server data
			players[id].interpolated = interpolated;

			players[id].interpolated.x = newPlayers[id].pos.x;
			players[id].interpolated.y = newPlayers[id].pos.y;

			players[id].interpolatedPrev = interpolatedPrev;

			players[id].interpolatedPrev.x = newPlayers[id].prevPos.x;
			players[id].interpolatedPrev.y = newPlayers[id].prevPos.y;

			players[id].interpolated.angle = newPlayers[id].angle;

			players[id].particles = particles;

		} else if (id != socket.id) {
			//console.log("Player", id, "connected");
			players[id] = new Rocket(newPlayers[id].pos.x, newPlayers[id].pos.y);
			players[id].interpolated = Ola({x: 0, y: 0, angle: 0}, 1000/serverUpdateRate);
			players[id].interpolatedPrev = Ola({x: 0, y: 0, angle: 0}, 1000/serverUpdateRate);
		}

		// Update client player

		if (id == socket.id) {
			players[id] = rocket;
			rocket.resources = newPlayers[id].resources;
			rocket.integrity = newPlayers[id].integrity;
		}
	}

	// Remove disconnected players
	for (let i in players) {
		let exists = false;
		for (let j in newPlayers) {
			if (i == j) {
				exists = true;
			}
		}

		if (!exists) {
			//console.log("Player", i, "disconnected");
			delete players[i];
		}
	}
})

var projectiles = [];
socket.on('projectile', function (data) {
	if (data.id != socket.id) { // Don't receive own projectiles
		if (data.type == "player" && server.players[data.id]) {
			data.pos = new Vector(server.players[data.id].pos.x, server.players[data.id].pos.y);
		}
		projectiles.push(data);
	} 
})

socket.on('delete', function(id) {
	delete planets[id];
})

// Emit random server console
socket.on('console', function (consoleData) {
	console.log(consoleData);
})

// Refresh if server code is updated
socket.on('refresh', function () {
	location.reload(true);
})