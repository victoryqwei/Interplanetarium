/*

This class provides all the data and functions for the rocket

*/

import Vector from "../util/Vector.js";
import {input} from "../game/input.js";
import {images} from "../world/assets.js";
import {game} from "../game/Game.js";
import {vfx} from "../visuals/VFXManager.js";

export default class Rocket {
	constructor(x, y, mass, width, height) {
		// Positional data
		this.pos = new Vector(x, y);
		this.prevPos = new Vector();
		this.vel = new Vector();
		this.acc = new Vector();

		this.speed = 0;

		// Orientation data
		this.heading = new Vector(1, 0);
		this.angle = 0;
		this.angularVelocity = 0;
		this.angleFromPlanet = 0;

		// Forces
		this.thrust = 0;
		this.steer = 0;
		this.gForce = 0;

		// Fuel
		this.fuel = 0;

		// Rocket integrity
		this.integrity = 100;
		this.maxIntegrity = this.integrity;

		this.alive = true;

		// Missiles
		this.shootDelay = 100;
		this.shootTime = Date.now();
		this.newMissiles = [];

		// World data
		this.closestPlanetDistance = 0;
		this.closestPlanet = undefined;

		// Set config
		let config = {
			width: width,
			height: height
		}
		this.setConfig(config);

		// Particles
		this.particles = [];

		this.name = "Player";
		this.color = "red";

		this.statistics = {
			speed: 10,
			resistance: 20,
			damage: 1
		}

		this.mortalCourse = false;
	}

	setConfig(cfg) {
		if (!cfg) cfg = {};

		this.height = cfg.height || 60;
		this.width = cfg.width || 20;

		this.radius = cfg.radius || 50;

		this.maxSpeed = cfg.maxSpeed || Infinity;
		this.landingSpeed = cfg.landingSpeed || 600;

		this.mass = cfg.mass || 100;
		this.maxThrust = cfg.maxThrust || 1000;
		this.thrustSpeed = cfg.thrustSpeed || this.maxThrust/100;

		this.steerSpeed = cfg.steerSpeed || 3;

		// Fuel
		this.maxFuel = cfg.maxFuel || 200000;
		this.fuel = this.maxFuel;
		this.fuelConsumption = cfg.fuelConsumption || 5;

		// Mining
		this.miningSpeed = cfg.miningSpeed || 0.01;

		// Shooting
		this.cooldown = 10;

		// Controls
		this.controlType = "mouse" // Or "keyboard"
	}

	update() {
		if (display.state != "play" || display.warp)
			return;

		this.getInput();
		this.move();
		this.updateVitals();
		this.collision();

		Rocket.addParticles(this);
	}

	getInput() {
		// Receive input
		let keys = input.keys;
		let mouse = input.mouse;
		let angle = mouse.copy();
		angle.sub(new Vector(canvas.width/2, canvas.height/2));
		
		// Respawn
		if (keys[82]) { // R
			if (!this.alive || this.fuel <= 0 || this.integrity <= 0)
				this.respawn();

			if (keys[16]) // Shift + R
				this.respawn();
		}

		// Steering
		if (this.closestPlanetDistance > 5 && this.fuel > 0 && this.alive && this.integrity > 0) { // Make sure you don't steer while on planet
			//this.angle = Math.atan2(angle.y, angle.x)+Math.PI/2;
			if (keys[37] || keys[65]) {
				this.steer = -1;
			} else if (keys[39] || keys[68]) {
				this.steer = 1;
			} else {
				this.steer = 0;
			}
		}

		// Check if there's still fuel
		if (this.fuel > 0 && this.alive && this.integrity > 0) {
			// Thrust
			if (keys[38] || keys[87] || keys[32]) {
				this.thrust = Math.min(this.maxThrust, this.thrust + this.thrustSpeed * delta / 16);
			} else if(keys[33]) { // Instant thrust? page down
				this.thrust = 500;
			} else {
				this.thrust = 0;
			}
		} else {
			this.thrust = 0;
		}

		// Shooting
		if ((mouse.left || keys[32]) && Date.now() - this.shootTime > this.shootDelay && this.alive) {
			// Reset shooting delay
			this.shootTime = Date.now();

			// Get player shooting direction
			let bulletPos = this.pos.copy();
			let playerHeading = mouse.copy();
			playerHeading.sub(new Vector(canvas.width/2, canvas.height/2));

			playerHeading.normalize();
			let playerAngle = Math.atan2(playerHeading.y, playerHeading.x);

			var missileData = {
				pos: bulletPos,
				vel: this.vel.copy(),
				acc: new Vector(),
				heading: playerHeading,
				angle: playerAngle,
				speed: 1,
				time: Date.now(),
				id: socket.id,
				origin: "player",
				type: "laser"
			}

			game.missiles.push(missileData)
			this.newMissiles.push(missileData)
		}
	}

	attract(planet) {
		// Get force from rocket to planet
    	var force = new Vector(planet.pos.x, planet.pos.y);
    	force.sub(this.pos);
	    var distance = force.getMag();

	    force.normalize();

	    var strength = (1 * this.mass * planet.mass) / (distance * distance);
	    force.mult(strength);

	    return force;
    }

    getClosestPlanet(planets) {
    	// Get the closest planet from the rocket
    	let closestDistance = Infinity;
    	for (let id in planets) {
    		let p = planets[id];
    		if (dist(p.pos, this.pos)-p.radius < closestDistance) {
    			closestDistance = dist(p.pos, this.pos) - p.radius - this.height/2;
    			this.angleFromPlanet = Math.atan2(p.pos.y-this.pos.y, p.pos.x-this.pos.x)/Math.PI*180;
    			this.closestPlanet = p;
    		}
    	}

    	return closestDistance;
    }

	move() {
		if (!game.map)
			return;

		this.prevPos = this.pos.copy(); // Previous pos

		if (!this.onPlanet) {
			this.angle += this.steer * this.steerSpeed / Math.PI * delta / 300;
		}

		// Get direction of rocket
		this.heading = Vector.rotate(new Vector(0, -1), this.angle);
		let thrustForce = this.heading.copy();
		thrustForce.mult(this.thrust);

		

		// Gravitational force
		let gravForce = new Vector();
		for (let id in game.screen.planets) {
			let p = game.screen.planets[id];
			gravForce.add(this.attract(p));
		}


		this.gForce = gravForce.getMag()/433;

		let netForce = thrustForce.copy();
		netForce.add(gravForce);
		this.acc = netForce.copy();
		this.acc.div(this.mass);

		this.vel.add(this.acc);

		this.speed = this.vel.getMag(); // Get speed in pixels per second
		if (this.speed > this.maxSpeed) { // Constrain to max speed
			this.vel.normalize();
			this.vel.mult(this.maxSpeed);
		}

		// New position
		this.pos.add(Vector.mult(this.vel, delta/1000));
	}

	updateVitals() {
		if (!game.map)
			return;

		// Update fuel
		let newFuel = this.fuel - (Math.abs(this.thrust) + Math.abs(this.steer)*200) * delta / 1000 * this.fuelConsumption;
		this.fuel = constrain(newFuel, 0, this.maxFuel);

		if (this.fuel <= 0) {
			if(this.alive) {
				game.sendLog("fuel");
			}
			this.alive = false;
			this.thrust = 0;
		}

		if (this.integrity <= 0) {
			if(this.alive) {
				game.sendLog("death");
			}
			this.alive = false;
			this.thrust = 0;
		}

		// Update closest planet distance
		this.closestPlanetDistance = Math.max(0, this.getClosestPlanet(game.screen.planets));
	}

	collision() {
		if (!game.map)
			return;

		let planets = game.screen.planets;
		if (!planets) // No planets in vicinity, return
			return;

		this.onPlanet = false;
		for (let id in planets) {
			let p = planets[id];

			// Crash detection
			if (!circleCollidesRect(p, this)) 
				continue;
				
			// Resolve collision
			let displacement = Vector.sub(this.pos, p.pos);
			let angle = Math.atan2(displacement.y, displacement.x);
			let angleDiff = (angle - (this.angle-Math.PI/2))%(Math.PI*2);
			this.goodLanding = Math.abs(angleDiff) < 0.5 || Math.abs(2*Math.PI-angleDiff) < 0.5;

			this.pos = this.prevPos.copy(); // Set position as one from previous frame
			this.vel = new Vector(); // Velocity becomes 0
			this.angularVelocity = 0; // Angular velocity becomes 0

			// Check if rocket is still in planet
			if (circleCollidesRect(p, this)) {
				// Perform rocket repel
				displacement.normalize();
				displacement.mult(delta/20);
				this.pos.add(displacement);
			}

			if (this.speed > this.landingSpeed || !this.goodLanding) {
				// High velocity or wrong landing
				if (this.alive) {
					game.sendLog("crash");
					vfx.add(this.pos, "explosion", {size: 100, alpha: 1, duration: 200})
					vfx.add(this.pos, "damage", {size: 30, alpha: 1, duration: 1000, text: -this.integrity, color: "red"})
				}
				this.alive = false;
			} else {
				// Perfect landing or Good landing
				this.fuel = constrain(this.fuel + delta * 10, 0, this.maxFuel);
				this.angle = angle+Math.PI/2;
				this.steer = 0;
				this.onPlanet = true;
			}
		}

		// Collision warning detection
        if (game.radar && this.vel) {
        	this.mortalCourse = false;

        	// Extrapolate the position of the rocket
        	let averageDelta = 1000/averageFps;
        	let heading = new Vector(this.vel.x/averageDelta*20, this.vel.y/averageDelta*20);
        	let headingPos = Vector.add(heading, this.pos);

        	for (let id in game.radar.planets) {
	        	let planet = game.radar.planets[id];
	        	let collision = inRadialView(Vector.copy(planet.pos), Vector.add(heading, this.pos), this.pos.copy(), planet.radius);

	        	if (collision && this.vel.getMag() > this.landingSpeed - 100) {
	        		this.mortalCourse = getDistance(planet.pos, this.pos) - planet.radius;
	        	}
	        }
	        drawLine(0, 0, heading.x, heading.y, this.mortalCourse ? "red" : "lime", 5)
        }  	
	}

	respawn() {
		if (!game.map)
			return;

		display.zoom = display.minZoom;

		// Spawn on Earth
		let spawnVector = Vector.rotate(new Vector(0, -200), random(0, Math.PI*2));
		this.pos = new Vector(spawnVector.x, 200+spawnVector.y);
		this.angle = Math.atan2(spawnVector.y, spawnVector.x)+Math.PI/2;
		/*// Spawn in a random location
		this.angle = random(0, Math.PI*2);
		let notSpawned = true;
		while (notSpawned) {
			this.pos = randCircle(2000);
			let collidedWithAnything = false;
			for (let id in game.map.planets) {
				let p = game.map.planets[id]
				if(circleCollidesRect(p, this)) {
					collidedWithAnything = true;
				}
			}

			if (!collidedWithAnything) {
				notSpawned = false;
			}
		}*/

		this.vel = new Vector();
		this.acc = new Vector();

		this.alive = true;
		this.steer = 0;

		this.fuel = this.maxFuel;
		this.integrity = this.maxIntegrity;

		socket.emit("respawn");
		$("#minimap-container").show();
		$("#interface-container").show();
	}

	static display(player, serverRocket, showParticles, name) {
		if (!player) {
			return;
		}
		if (!player.alive) {
			return;
		}
		// Draw the player
		let rocket = game.rocket;
		let zoom = display.warp ? display.mapZ : display.zoom;

		let width = (player.width || rocket.width) * zoom;
		let height = (player.height || rocket.height) * zoom;
		let pos = new Vector(canvas.width/2, canvas.height/2);

		if (serverRocket) {
			Rocket.addParticles(player);
			pos = getScreenPos(player.pos, zoom, rocket.pos);
		}

		// Draw particle
		if (showParticles) {
			Rocket.animateParticles(player, serverRocket);
		}

		// Check if rocket is in the screen
		if (!inScreen(player.pos, 1, 20, rocket.pos))
			return;

		// Draw body
        drawRect(pos.x, pos.y, width, height, player.angle, "#d3d3d3");
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(player.angle);

        // Set your mom
        let halfWidth = width/2;
        let halfHeight = height/2;

        // Draw thruster flame
        if (player.thrust > 0) {
        	let thrustLength = scale(player.thrust/rocket.maxThrust, 0, 1, 0.2, 1.5);
	       	drawTriangle(halfWidth, width*2 + (width*thrustLength / 2), width/3, width*thrustLength, Math.PI, "orange");
	        drawTriangle(-halfWidth, width*2 + (width*thrustLength / 2), width/3, width*thrustLength, Math.PI, "orange");
        }
        // Draw thrusters
        drawRect(-halfWidth, halfHeight, halfWidth, width, 0, player.color || "red");
        drawRect(halfWidth, halfHeight, halfWidth, width, 0, player.color || "red");
        // Draw nose cone
        drawTriangle(0, -halfHeight - halfWidth, width, width, 0, player.color || "red");
        // Draw player window
        drawRoundedRect(0-width/4, -width, halfWidth, width, 3*zoom, "rgb(70, 70, 70)")
        // Draw thruster caps
        drawTriangle(halfWidth, width/1.33, halfWidth, halfWidth, 0, player.color || "red");
        drawTriangle(-halfWidth, width/1.33, halfWidth, halfWidth, 0, player.color || "red");
        // Draw body accent
        drawTriangle(0, height/4, width/1.5, -width/1.5, 0, pSBC(-0.05, pSBC(Math.max(-(1-(player.integrity/100)), -1), "#d3d3d3", false, true), false, true));

        ctx.restore();
        
        if(/*serverRocket && */!display.warp)
        	drawText(name, pos.x, pos.y - height*1.2, 20+ "px Arial", "white", "center", "middle", 1);
    
	}

	static addParticles(player) {
		if (player.thrust <= 0)
			return;

		let rocket = game.rocket;

		let maxParticles = 1; // Change particles based on the FPS
		let thrustRatio = player.thrust/rocket.maxThrust;

		var rocketHeading = Vector.rotate(new Vector(0, -1), player.angle);
		rocketHeading.mult(-rocket.height/2-rocket.width/2);

		// Get thruster position
		var thrusterPos = new Vector(player.pos.x, player.pos.y);
		thrusterPos.add(rocketHeading);

		// Get previous thrust position (to be interpolated)
		var thrusterPos2;
		if (player.prevPos)
			thrusterPos2 = new Vector(player.prevPos.x, player.prevPos.y);
		else
			thrusterPos2 = new Vector(player.pos.x, player.pos.y);
		thrusterPos2.add(rocketHeading);
		
		// Add particles
		for (var i = 0; i < thrustRatio*maxParticles; i++) {
			let randomPoint = interpolate(thrusterPos, thrusterPos2, Math.random());
			// Add smoke particles
			let smokeOffset = (rocket.width)/2;

			let smokeParticle = new Vector(
				randomPoint.x+random(-smokeOffset, smokeOffset),
				randomPoint.y+random(-smokeOffset, smokeOffset)
			);

			smokeParticle.time = Date.now();
			smokeParticle.type = "smoke";
			player.particles.push(smokeParticle);
		}
	}

	static animateParticles(player, serverRocket) {
		let zoom = display.warp ? display.mapZ : display.zoom;
		let rocket = game.rocket;
		let smoke = images.smoke;
		let smokeDuration = 500;

		if (!smoke || !player.particles)
			return;

		let pos = new Vector(canvas.width/2, canvas.height/2);

		for (let i = 0; i < player.particles.length; i++) {
			let p = player.particles[i];
        	if (p.type == "smoke" && inScreen(p, 1, 20, rocket.pos) && !display.performanceMode) {
        		let size = rocket.width * random(1, 1.5);
				let particle = getScreenPos(p, zoom, rocket.pos);
	        	ctx.globalAlpha = constrain(1-(Date.now()-p.time)/smokeDuration, 0, 1);
	            ctx.drawImage(smoke,
					particle.x-size*zoom/2,
					particle.y-size*zoom/2,
	            	size*zoom,
	            	size*zoom
	            );
        	}

            ctx.globalAlpha = 1;
		}

		// Remove old particles
		for (let i = player.particles.length-1; i > 0; i--) {
			if (player.particles[i].type == "smoke" && Date.now()-player.particles[i].time > smokeDuration) {
	        	player.particles.splice(i, 1);
	        }
		}
	}
}