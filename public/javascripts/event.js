var server;

socket.on('init', function (serverData) {
	server = serverData;
	for (var i = 0; i < serverData.map.planets.length; i++) {
		let p = serverData.map.planets[i];

		let newPlanet = new Planet(p.pos.x, p.pos.y, p.mass, p.radius, p.type, p.name, p.color, p.strokeColor, p.resource);
		planets.push(newPlanet);
	}
});

socket.on('update', function (data) {
	server.players = data;
})