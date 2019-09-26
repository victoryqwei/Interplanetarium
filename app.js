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
let maxPlayers = 10;

class Server {
	constructor() {
		this.players = {}; // Players are selected based on their socket id
		this.map = new Map();	
		this.id = Function.randomString(10);
	}

	addPlayer(socketId) {
		this.players[socketId] = new Rocket();
	}

	update() {
		for (let id in this.players) {
			if (io.sockets.connected[id])
				io.sockets.connected[id].emit('update', this.players);
		}
	}
};

function optimizeServer() {

	if(servers.length > 1) {

		var currentServers = servers.slice();
		var desirableServers = [];

		for (let i = 0; i < currentServers.length; i++) {
			let players = 1;
			for(let j = 0; j < currentServers.length; j++) {
				let s = currentServers[j];
				if(Object.keys(s.players).length > players && Object.keys(s.players).length < 10) {
					players = Object.keys(s.players).length;
					desirableServers.push(s);
					currentServers.splice(j, 1);
				}
			}
		}

		for (let i = 0; i < servers.length; i++) {
			if(Object.keys(servers[i].players).length == 1 && desirableServers.length > 0) {
				console.log("Wanting to switch player " + Object.keys(servers[i].players)[0] + " to server " + desirableServers[desirableServers.length-1].id + " with " + Object.keys((desirableServers[desirableServers.length-1]).players).length + " players");
			}
		}
	}
}

function findServer() {
	// Connect to server - MAKE THIS INTO A FUNCTION
	let foundServer = false;
	for(let s of servers) {
		if(Object.keys(s.players).length < maxPlayers) {
			return s;
			foundServer = true;
		}
	}

	if(!foundServer) {
		servers.push(new Server());
		return servers[servers.length-1];
	}

	console.log(servers.length);
}

servers.push(new Server());


// Server-client connection architecture
io.on('connection', function(socket) { 
	// Find a server
	let server = findServer();
	server.addPlayer(socket.id);

	console.log('ID: ' + socket.id + ' connected to server ID: ' + server.id + ' on ' + Date())

	socket.emit('init', server); // Send initial data

	socket.on('data', function (data) {
		server.players[socket.id] = data;
		//console.log(data.pos);
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

optimizeServer();

}, 100);

module.exports = app;