function setup() {

	// Define rocket
	rocket = new Rocket(0, 0, 23000, 10, 27);

    // Add stars
    stars = [];

    for (var i = 0; i < 5000; i++) {
    	stars.push(new Star(10000, 10000));
    }

   	addStats();

    console.log("Finished setting up assets");
    console.log("Created by Victor Wei and Evan Cowan");
    console.log("#KM");
    console.log("Join our discord server to give suggestions or feedback (in-game perks included): https://discord.gg/uKYXPeA");
}

function update() {

	// Update interface scale
	display.interfaceScale = 0 + interfaceSlider.value / 50;

	rocket.update(); // Update rocket

	updateZoom(rocket); // Update zoom based on rocket speed
}

function draw() {
	ctx.save();
	ctx.translate(canvas.width/2 - rocket.pos.x, canvas.height/2 - rocket.pos.y);

	drawSpace();

	for (let s of stars) { // Draw stars
		s.display();
	}

	for (let p of planets) {
		p.display();
		p.drawMarker();
	}

	rocket.display();

	displayPlayers();

	ctx.restore();

	drawInterface();
	drawRespawn(); // Death screen

	if(display.advanced) {
		drawStats();
	}

	drawMenu();
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


// Game loop

var fps = 1000;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var fpsArray = [];
var averageArray;

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