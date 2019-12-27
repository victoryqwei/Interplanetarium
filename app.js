// Initialize server variables
var express = require('express');
var app = express();
var https = require('https');
var fs = require('fs');
var options = {
	key: fs.readFileSync('./cert/ia.key'),
	cert: fs.readFileSync('./cert/server.crt'),
	ca: fs.readFileSync('./cert/ca.crt')
}

// Create HTTPS server
var server = https.createServer(options, app);
var path = require('path');
var readline = require('readline'); // Command line input
var fs = require('fs');
var io = require('socket.io')(server);

// Add local modules
var Vector = require('./modules/Vector.js');
var Map = require('./modules/Map.js');
var Rocket = require('./modules/Rocket.js');
var Function = require('./modules/Function.js');

// Create port
var serverPort = 3001;
server.listen(serverPort, function () {
	console.log('Started an https server on port ' + serverPort);
})
var public = __dirname + '/public/';
app.use(express.static(path.join(__dirname, 'public')));
app.use('/*', function (req, res, next) {
	res.redirect('/')
	next()
})

// Server input commands

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Commmand line input
rl.on('line', (input) => {
  	if (input === 'refresh') {
  		io.emit('refresh');
  	} else if (input.split(" ")[0] === "ban") {
  		console.log(input.split(" ")[1])
  	}
});

// Send client refresh
io.emit('refresh', '');
io.emit('console', 'The game has updated, please hard refresh the code using ctrl-f5 to continue playing the game.')

// Server Class
var resourceTypes = ["Iron", "Copper", "Lead", "Kanium"];
var servers = [];
let serverUpdateRate = 20;
let maxPlayers = 10;

class Server {
	constructor() {
		this.players = {}; // Players are selected based on their socket id
		this.spectators = {};
		this.projectiles = [];
		this.map = new Map(50, 10000);
		this.id = Function.randomString(10);

		this.lastTick = Date.now();
		this.bufferUpdateRate = [];
		this.updateRate = 0;
	}

	addPlayer(socketId, name, color) {
		this.players[socketId] = new Rocket(0, 200, 23000, 10, 27, name, color);
	}

	addSpectator(socketId) {
		this.spectators[socketId] = new Spectator();
	}

	update() {
		// Update server info - NEEDS TO BE HEAVILY OPTIMIZED
		this.updateProjectiles();

		for (let id in this.players) {
			this.harvestPlanets(this.players[id]);

			this.shootAtPlayers(this.players[id]);

			this.checkProjectiles(this.players[id], id);

			this.collisionResponse(this.players[id]);
		}

		// Calculate the update rate of this server
		this.bufferUpdateRate.push(Date.now()-this.lastTick);
		this.lastTick = Date.now();
		if (this.bufferUpdateRate.length > 30) {
			this.bufferUpdateRate.shift();
		}
		this.updateRate = this.bufferUpdateRate.reduce((a, b) => a + b, 0)/this.bufferUpdateRate.length;

		// Send data
		for (let id in this.players) {
			if (io.sockets.connected[id])
				io.sockets.connected[id].emit('update', this);
		}

		for (let id in this.spectators) {
			if (io.sockets.connected[id])
				io.sockets.connected[id].emit('update', this);
		}
	}

	shootAtPlayers(rocket) {
		let planets = this.map.planets;
		for (let id in planets) {
			let p = planets[id];

			for (let i = p.turrets.length-1; i >= 0; i--) {
				let t = p.turrets[i]
				if (t.health <= 0) {
					p.turrets.splice(i, 1);
				} else {
					t.update(this.players, p, io, this.projectiles);
				}
			}

			for (let i = p.bases.length-1; i >= 0; i--) {
				let t = p.bases[i]
				if (t.health <= 0) {
					p.bases.splice(i, 1);
				} else {
					t.update(this.players, p);
				}
			}
		}
	}

	// Move the projectiles in the server
	updateProjectiles() {
		let planets = this.map.planets;
		let delta = serverUpdateRate;
		for (let i = this.projectiles.length-1; i >= 0; i--) {
			let p = this.projectiles[i];

			var old = Date.now() - p.time > 10000;
			var newProjectile = Date.now() - p.time > 100;
			var collision = false;

			for (let id in planets) {
				let p2 = planets[id];
				if (Function.dist(p.pos, p2.pos) < p2.radius + 5 && newProjectile) {
					collision = true;
				}
			}

			// Collision with player
			/*for (let id in this.players) {
				let p3 = this.players[id];
				if (Function.dist(p.pos, p3.pos) < 50 && newProjectile) {
					collision = true;
				}
			}*/

			if (Function.dist(new Vector(), p.pos) > this.map.mapRadius + 1000) { // out of bounds projectile
				collision = true;
			}

			if (old || collision) {
				this.projectiles.splice(i, 1);
			}

			var deltaPos = new Vector(p.heading.x, p.heading.y);
			deltaPos.mult(delta);
			p.pos.x += p.speed*deltaPos.x + p.vel.x*delta/1000;
			p.pos.y += p.speed*deltaPos.y + p.vel.y*delta/1000;
		}
	}

	// Check if rocket is outside of the map and tick off health
	collisionResponse(rocket) {
		if (Function.dist(new Vector(), rocket.pos) > this.map.mapRadius) {
			rocket.integrity -= 0.2;
		}
	}

	// Check for collision with rocket
	checkProjectiles(rocket, id) {
		let planets = this.map.planets;

		for (let i = this.projectiles.length-1; i >= 0; i--) {
			let p = this.projectiles[i];
			let distance = Function.dist(p.pos, rocket.pos);
			let collision = false;
			if (distance < 5 + rocket.height && p.id != id) {
				rocket.integrity -= 1;
				collision = true;
			}

			for (let id in planets) {
				let p2 = planets[id];
				if (p2.name != "Earth") {
					for (let j = p2.turrets.length-1; j >= 0; j--) {
						let t = p2.turrets[j];
						let d = Function.dist(p.pos, t.pos);

						if (d < 40 && p.id != t.id) {
							t.health -= 5;
							collision = true;
						}
					}

					for (let j = p2.bases.length-1; j >= 0; j--) {
						let t = p2.bases[j];
						let d = Function.dist(p.pos, t.pos);

						if (d < 40 && p.id != t.id) {
							t.health -= 5;
							collision = true;
						}
					}
				}
			}

			if (collision) {
				this.projectiles.splice(i, 1);
			}
		}
	}

	harvestPlanets(rocket) {
		let delta = serverUpdateRate;
		let planets = this.map.planets;
		for (let id in planets) {
			let p = planets[id];

			let withinDist = Function.dist(p.pos, rocket.pos) < (p.radius + rocket.height);
			if (withinDist && !rocket.crashed && rocket.fuel > 0 && rocket.integrity > 0 && rocket.oxygen > 0) {

				// Mine resources
				if (p.resource.amount > 0 && p.resource.type != "None") {
					// Decrease resource on planet and increase resource gained from player
					p.resource.amount = Math.max(
						p.resource.amount-rocket.miningSpeed*delta,
						0
					);



					let resourceType = p.resource.type;
					rocket.resources[resourceType] = Math.max(
						rocket.resources[resourceType]+rocket.miningSpeed*delta,
						0
					);

					p.radius = p.maxRadius * (p.resource.amount/p.resource.totalAmount);

					//io.emit('console', rocket.resources);

					// Change planet properties
					let lastRadius = p.radius;
					p.radius = p.maxRadius * (p.resource.amount/p.resource.totalAmount);
					p.mass = p.maxMass * (Math.pow(p.radius, 2)/Math.pow(p.maxRadius, 2));

					// Change player position to new planet radius

					// We don't have to do this yet

					/*let deltaRadius = lastRadius-p.radius;
					let deltaPos = new Vector(0, 1);
					deltaPos = Vector.rotate(deltaPos, rocket.angle+Math.PI/2);
					deltaPos.mult(deltaRadius);
					rocket.pos.add(deltaPos);*/

					// Delete the planet once resources are fully depleted
					if (p.radius <= 10) {
						console.log("Deleting planet")
						io.emit('delete', id);
						delete planets[id];
					}
				}
			}
		}
	}
};

servers.push(new Server());

function queueServer() {

	// Connect to server
	let foundServer = false;
	for(let s of servers) {
		if(Object.keys(s.players).length < maxPlayers) {
			return s;
			foundServer = true;
		}
	}

	// If no servers avaliable, create new sever
	if(!foundServer) {
		servers.push(new Server());
		return servers[servers.length-1];
	}
}

function spectateServer() {
	let foundServer = false;
	for(let s of servers) {
		if(Object.keys(s.players).length < maxPlayers) {
			return s;
			foundServer = true;
		}
	}
}

function optimizeServers() {

	// Optimize if there is more than one server
	if(servers.length > 1) {

		var currentServers = servers.concat();
		var desirableServers = [];

		// Find most desirable servers to play on
		for (let i = 0; i < currentServers.length; i++) {
			var players = 1;
			var bestServer = undefined;
			for(let j = 0; j < currentServers.length; j++) {
				if(Object.keys(currentServers[j].players).length > players && Object.keys(currentServers[j].players).length < maxPlayers) {
					players = Object.keys(currentServers[j].players).length;
					bestServer = j;
				}
			}
			if(currentServers[bestServer] != null) {
				desirableServers.push(currentServers[bestServer]);
				currentServers.splice(bestServer, 1);
			}
		}

		// Switch players to better servers
		for (let i = 0; i < servers.length; i++) {
			if(Object.keys(servers[i].players).length == 1 && desirableServers.length > 0) {
				io.emit('console', ("Wanting to switch player " + Object.keys(servers[i].players)[0] + " to server " + desirableServers[desirableServers.length-1].id + " with " + Object.keys((desirableServers[desirableServers.length-1]).players).length + " players"));
			}
		}

		// Remove servers with no people
		for (let i = 0; i < servers.length; i++) {
			if(Object.keys(servers[i].players).length == 0) {
				servers.splice(i, 1);
			}
		}

	}
}

class Spectator {
	constructor() {
		this.pos = new Vector();
		this.vel = new Vector();
	}
}

// Server-client connection architecture
io.on('connection', function(socket) {

	// Find a server
	let server = spectateServer();
	server.addSpectator(socket.id);

	console.log('ID: ' + socket.id + ' connected to server ID: ' + server.id + ' on ' + Date())

	socket.emit('init', server); // Send initial data

	let timeoutId;


	socket.on('joinServer', function (data) {

		for (let i = 0; i < servers.length; i++) {
			if(servers[i].id == data.serverId) {
				servers[i].spectators[data.socketId] = undefined;
				delete servers[i].spectators[data.socketId];
				let server = queueServer();
				server.addPlayer(socket.id, data.name, data.color);
			}
		}

	});

	socket.on('data', function (data) {
		let player = server.players[socket.id];

		// Update new data
		server.players[socket.id] = Object.assign({}, server.players[socket.id], data);

		// Afk timeout (no input from player)

		// Disconnect fallback (if player fails to send update)
		clearTimeout(timeoutId);
		timeoutId = setTimeout(function () {
			delete server.players[socket.id];
			console.log(socket.id + " left at "  + Date());
		}, 5000);
	})

	socket.on('respawn', function (data) {
		let player = server.players[socket.id];

		if (player) {
			player.crashed = false;
			player.steer = 0;

			player.fuel = player.maxFuel;
			player.oxygen = player.maxOxygen;

			player.integrity = player.maxIntegrity;

			if (player.resources) {
				for (var i = 0; i < resourceTypes.length; i++) {
					player.resources[resourceTypes[i]] = 0;
				}
			}
		}
	})

	socket.on('projectile', function (data) {
		data.time = Date.now();
		server.projectiles.push(data);
		io.emit('projectile', data);
	})

	socket.on('disconnect', function () {
		io.emit('disconnection', socket.id);

		delete server.players[socket.id];
		delete server.spectators[socket.id];
		console.log(socket.id + " left at "  + Date());
	});

});

setInterval(function(){

for (let s of servers) {
	s.update();
}

}, 1000/serverUpdateRate);

/*setInterval(function () {
	optimizeServers();
}, 5000);*/

module.exports = app;
