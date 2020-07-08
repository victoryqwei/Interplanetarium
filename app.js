// Initialize server variables
var express = require('express');
var app = express();
var https = require('https');
var fs = require('fs');
var options = {
	key: fs.readFileSync('./bin/ia.key'),
	cert: fs.readFileSync('./bin/server.crt'),
	ca: fs.readFileSync('./bin/ca.crt')
}

// Create HTTPS server
var server = https.createServer(options, app);
var path = require('path');
var readline = require('readline'); // Command line input
var fs = require('fs');
var io = require('socket.io')(server);

// Set title
var setTitle = require('console-title');
setTitle('Interplanetarium Server');

// Create port
var serverPort = process.env.PORT || 3006;
server.listen(serverPort, function () {
	console.log('Started an https server on port ' + serverPort);
})
var public = __dirname + '/public/';
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`))

// Server input commands
/*const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Commmand line input
rl.on('line', (input) => {
  	if (input === 'refresh') {
  		io.emit('refresh');
  	}
});*/

// ADD SERVER FILES - CREATE A ROOM MANAGER
var Room = require('./modules/server/Room.js');

var rooms = {};

// Handle player connection
io.on('connection', function(socket) {
	let roomId = undefined;

	// Join a room
	socket.on("joinRoom", (data) => {
		if (!roomId) {
	    	roomId = data.id;

			socket.join(data.id, () => {
				if (!rooms[data.id]) {
					rooms[data.id] = new Room(data.id, io);
				}
				rooms[data.id].join(socket.id, data.name);
			});
		}
	})
	
	// Receive updates from the player
	socket.on('update', (data) => {
		if (roomId && rooms[roomId])
			rooms[roomId].receivePlayerData(data);
	})

	// Latency check
	socket.on('pingServer', function (data) {
		socket.emit('pongServer', data);
	})

	// Receive log
	socket.on('serverLog', (data) => {
		if (roomId)
			rooms[roomId].receiveLog(data, socket.id);
	})

	// Disconnect
	socket.on("disconnect", () => {
		socket.leave(roomId, () => {
			if (rooms[roomId]) {
				rooms[roomId].leave(socket.id); // let the server manager manage this
			}
			console.log("Left room with id: ", roomId)
		})
	})

});

let tps = 30;
let tick = Math.round(1000/tps);

// Server loop
setInterval(function() {

	for (let id in rooms) {
		let room = rooms[id];
		room.update(io);
	}

}, tick);

module.exports = app;