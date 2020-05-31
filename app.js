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

// ADD SERVER FILES

// Util
var Vector = require('./modules/Vector.js');

// Game


// Server input commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Commmand line input
rl.on('line', (input) => {
  	if (input === 'refresh') {
  		io.emit('refresh');
  	}
});

// Handle player connection
io.on('connection', function(socket) {
	let roomId = undefined;

	// Create a room
	socket.on("joinRoom", function (id) {
		if (!roomId) {
			console.log("Created room with id: " + id)
			socket.join(id, () => {
				let rooms = Object.keys(socket.rooms);
	    		roomId = id;
				io.to(id).emit("msg", "Joined room: " + id);
			});
		}
	})

	// Join a room
	socket.on("joinRoom", function () {

	})

	// Disconnect
	socket.on("disconnect", () => {
		socket.leave(roomId, () => {
			console.log("Left room with id: ", roomId)
		})
	})

});

// Server loop
setInterval(function() {


}, 20);

module.exports = app;