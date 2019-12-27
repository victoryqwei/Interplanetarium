function setup() {

	// Spawn rocket
	rocket = new Rocket(0, 200, 23000, 10, 27);

	ui = new Interface();

    // Add stars
    stars = [];

    for (var i = 0; i < 5000; i++) {
    	stars.push(new Star(10000, 10000));
    }

   	addStats();

   	console.log("___________________\n\nInterplanetarium\n\nCreated by Victor Wei and Evan Cowan\n\nJoin our discord server to give suggestions or feedback (in-game perks included): \nhttps://discord.gg/uKYXPeA\n___________________");

   	// Update client data
	setInterval(function(){
	    if (server && display.play == 0) {
			rocket.t = Date.now();

			var updateData = {
				pos: rocket.pos,
				prevPos: rocket.prevPos,
				heading: rocket.heading,
				angle: rocket.angle,
				crashed: rocket.crashed,
				fuel: rocket.fuel,
				oxygen: rocket.oxygen,
				thrust: rocket.thrust
			}
			socket.emit('data', updateData);
		}
	}, 50);

	updateZoom(rocket);
}

function update() {

	// Update interface scale
	display.interfaceScale = 0 + interfaceSlider.value / 50;
	updateCookie("userScale", display.interfaceScale);

	ui.HUDwidth = display.HUDwidth * display.interfaceScale;
	ui.HUDheight = display.HUDheight * display.interfaceScale;
	ui.viewPadding = display.viewPadding * display.interfaceScale;
	ui.textSpacing = display.textSpacing * display.interfaceScale;
	ui.planetSize = ui.HUDheight * 0.75;
	ui.HUDpadding = ui.HUDheight * 0.125;

	if (rocket.showRocket && display.play == 0) {
		rocket.update(); // Update rocket
		updateZoom(rocket); // Update zoom based on rocket speed
	}

	if (server.map) {
		updateProjectiles();
	}

	if(display.play == 2) {
		display.minZoom = 0.1;
		updateSpectatorControls();
	} else {
		display.minZoom = 0.8;
	}
}

function draw() {

	ctx.save();
	ctx.translate(canvas.width/2 - rocket.pos.x, canvas.height/2 - rocket.pos.y);
	drawSpace();

	for (let s of stars) { // Draw stars
		if(server.map) { // The ugly WEI
			if(getDistance(0, 0, s.pos.x + rocket.pos.x - (rocket.pos.x / s.starDistance), s.pos.y + rocket.pos.y - (rocket.pos.y / s.starDistance)) <= server.map.mapRadius) {
				s.display();
			}
		} else {
			s.display();
		}
	}

	for (let id in planets) {
		let p = planets[id];

		p.display();
		if(display.play == 0) {
			p.drawMarker();
		}
	}

	for (let id in planets) {
		let p = planets[id];
		p.displayTurret();
		p.displayBase();
	}

	// Server display
	if (server) {
		displayPlayers();
	}

	displayProjectiles();
	

	if (rocket.showRocket && server && server.players[socket.id]) {
		if(display.play == 0 || Object.keys(server.players).length > 0) {
			Rocket.display(rocket, false, true);
		}
	}

	animationLoop();

	ctx.restore();

	ui.drawInterface();

	drawRespawn(); // Death screen

	if(display.advanced) {
		drawStats();
	}
}

function updateSpectatorControls() {

	display.spectate = false;

	if(keys[65]) {
		rocket.pos.x -= 0.5*delta/display.zoom/2;
	}
	if(keys[87]) {
		rocket.pos.y -= 0.5*delta/display.zoom/2;
	}
	if(keys[68]) {
		rocket.pos.x += 0.5*delta/display.zoom/2;
	}
	if(keys[83]) {
		rocket.pos.y += 0.5*delta/display.zoom/2;
	}

}

// Keyboard events

var keys = {};
onkeydown = onkeyup = function(e){
    e = e || event;
    keys[e.keyCode] = e.type == 'keydown';
}

// Scroll event
var scrollSpeed = 0.01;
$(window).bind('mousewheel', function(event) {
	if (event.originalEvent.wheelDelta >= 0 && display.zoom < display.maxZoom) {
        display.zoom += display.zoom/8;
    } else if (event.originalEvent.wheelDelta <= 0 && display.zoom > display.minZoom) {
        display.zoom -= display.zoom/8;
    }
});

var mouse = new Vector();
$("#canvas").on("mousemove", function (e) {
	mouse.x = e.offsetX;
	mouse.y = e.offsetY;
})

$("#canvas").on("mousedown", function (e) {
	mouse.down = true;
}).on("mouseup", function (e) {
	mouse.down = false;
})


// Game loop

var fps = 1000;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var fpsArray = [];
var averageFps;

function loop(showFPS, callback) {
    requestAnimationFrame(loop);

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
        then = now - (delta % interval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        update();
        draw();

    	// Get average frames per second with a 30 frame buffer

        fpsArray.push(1000/delta);
        if (fpsArray.length > 30) {
            fpsArray.shift();
        }
    }
}

// Run
setup();
loop();
