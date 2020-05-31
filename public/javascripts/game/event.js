/*

Receives events from the server

*/

(function () {

	window.socket = io("/");

	socket.on("msg", function (msg) {
		console.log(msg);
	})

}())