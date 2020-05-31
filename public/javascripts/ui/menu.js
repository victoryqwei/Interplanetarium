/*

Used to manage the UI of the menu

*/

(function () {

	let roomId = undefined;

	// Join / create a room
	$(window).click(function () {
		if (!roomId) {
			let id = window.location.pathname.replace("/", "") || randomString(7);
			console.log("Joining room with id", id);
			socket.emit("joinRoom", id);
			roomId = id;
		}
	})

}())