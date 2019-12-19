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

var servers = [];
let serverUpdateRate = 20;
let maxPlayers = 10;

class Server {
	constructor() {
		this.players = {}; // Players are selected based on their socket id
		this.map = new Map(30);
		this.id = Function.randomString(10);
	}

	addPlayer(socketId) {
		this.players[socketId] = new Rocket();
	}

	update() {
		for (let id in this.players) {
			this.harvestPlanets(this.players[id]);

			this.shootPlayers(this.players[id]);
		}

		for (let id in this.players) {
			if (io.sockets.connected[id])
				io.sockets.connected[id].emit('update', this);
		}
	}

	shootPlayers(rocket) {
		let planets = this.map.planets;
		for (let id in planets) {
			let p = planets[id];
			for (let t of p.turrets) {
				t.update(this.players, p);
				/*if (Function.dist(t.pos, rocket.pos) < 500) {
					let direction = new Vector(rocket.pos.x, rocket.pos.y);
					direction.sub(new Vector(t.pos.x, t.pos.y));

					t.projectiles.push({angle: Math.atan2(direction.y, direction.x), time: Date.now()})
				}*/
			}
		}
	}

	harvestPlanets(rocket) {
		let delta = serverUpdateRate;
		let planets = this.map.planets;
		for (let id in planets) {
			let p = planets[id];

			let withinDist = Function.dist(p.pos, rocket.pos) < (p.radius + rocket.height);
			if (withinDist && !rocket.crashed) {

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
					/*let lastRadius = p.radius;
					p.radius = p.maxRadius * (p.resource.amount/p.resource.totalAmount);
					p.mass = p.maxMass * (Math.pow(p.radius, 2)/Math.pow(p.maxRadius, 2));*/

					// Change player position to new planet radius

					// We don't have to do this yet

					/*let deltaRadius = lastRadius-p.radius;
					let deltaPos = new Vector(0, 1);
					deltaPos = Vector.rotate(deltaPos, rocket.angle+Math.PI/2);
					deltaPos.mult(deltaRadius);
					rocket.pos.add(deltaPos);*/
				}
			}
		}
	}
};

servers.push(new Server());

function findServer() {

	// Connect to server
	let foundServer = false;
	for(let s of servers) {
		if(Object.keys(s.players).length < maxPlayers) {
			return s;
			foundServer = true;
		}
	}

	//If no servers avaliable, create new sever
	if(!foundServer) {
		servers.push(new Server());
		return servers[servers.length-1];
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

// Server-client connection architecture
io.on('connection', function(socket) {
	// Find a server
	let server = findServer();
	server.addPlayer(socket.id);

	console.log('ID: ' + socket.id + ' connected to server ID: ' + server.id + ' on ' + Date())

	socket.emit('init', server); // Send initial data

	let timeoutId;

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

	socket.on('disconnect', function () {
		io.emit('disconnection', socket.id);
		delete server.players[socket.id];
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
