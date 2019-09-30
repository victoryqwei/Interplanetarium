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

	console.log("Client ID: " + socket.id, "Server ID: " + server.id);
});

var server = {};
var serverUpdateRate = 5;
let prev = Date.now();

socket.on('update', function (serverData) {

	// Update map
	let map = serverData.map;

	for (let id in map.planets) {
		let p = map.planets[id];

		planets[id].resource.amount = p.resource.amount;
	}

	// Update and interpolate player data
	let players = server.players;
	let newPlayers = serverData.players;

	for (let id in newPlayers) {
		if (id != socket.id && players[id]) { // Check if player exists in client and not itself
			// Save interpolated data;
			let interpolated = players[id].interpolated;

			if (!interpolated) {
				players[id].interpolated = Ola({x: 0, y: 0, angle: 0}, 1000/serverUpdateRate);
				interpolated = players[id].interpolated;
			}

			// Update new data
			players[id] = newPlayers[id];

			// Restore server data
			players[id].interpolated = interpolated;

			players[id].interpolated.x = newPlayers[id].pos.x;
			players[id].interpolated.y = newPlayers[id].pos.y;

			players[id].interpolated.angle = newPlayers[id].angle;

		} else if (id != socket.id) {
			console.log("Player", id, "connected");
			players[id] = new Rocket(newPlayers[id].pos.x, newPlayers[id].pos.y);
			players[id].interpolated = Ola({x: 0, y: 0, angle: 0}, 1000/serverUpdateRate);
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
			console.log("Player", i, "disconnected");
			delete players[i];
		}
	}
})

// Emit random server console
socket.on('console', function (consoleData) {
	console.log(consoleData);
})
