/*

This class provides all the data and functions for the rocket

*/

import Vector from "../util/Vector.js";
import {input} from "../game/input.js";
import {images} from "../world/assets.js";
import {game} from "../game/Game.js";
import {vfx} from "../visuals/VFXManager.js";
import {camera} from "../visuals/Camera.js";
import {draw} from "../visuals/Draw.js";
import {util} from "../util/Util.js";
import {replay} from "../game/Replay.js";

export default class Rocket {
	constructor(x, y, mass, width, height) {
		// Positional data
		this.pos = new Vector(x, y);
		this.prevPos = new Vector();
		this.vel = new Vector();
		this.acc = new Vector();

		this.xp = 0;
		this.speed = 0;
		this.lives = 3;

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
		this.shootDelay = 200;
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
		this.deathTick = Date.now();
	}

	setConfig(cfg) {
		if (!cfg) cfg = {};

		// Dimensions
		this.height = cfg.height || 60;
		this.width = cfg.width || 20;
		this.radius = cfg.radius || 50;

		// Speed
		this.maxSpeed = cfg.maxSpeed || 1000;
		this.landingSpeed = cfg.landingSpeed || 600;

		// Mass
		this.mass = cfg.mass || 100;

		// Thrust
		this.maxThrust = cfg.maxThrust || 700;
		this.thrustSpeed = cfg.thrustSpeed || this.maxThrust/100;
		this.steerSpeed = cfg.steerSpeed || 3;

		// Fuel
		this.maxFuel = cfg.maxFuel || 100000;
		this.fuel = this.maxFuel;
		this.fuelConsumption = cfg.fuelConsumption || 5;

		// Mining
		this.miningSpeed = cfg.miningSpeed || 0.01;

		// Shooting
		this.cooldown = 10;

		// Controls
		this.controlType = "mouse" // Or "keyboard"

		this.respawnTime = 5000;
	}

	update() {
		if (game.state == "menu" || camera.warp || !game.map)
			return;

		this.updateVitals();
		this.getInput();
		if (!this.alive || game.state == "replay")
			return
		this.move();
		this.collision();
		draw.addParticles(this);
	}

	getInput() {
		// Receive input
		let keys = input.keys;
		let mouse = input.mouse;
		let angle = mouse.copy();
		angle.sub(new Vector(canvas.width/2, canvas.height/2));
		
		// Respawn
		if (keys[82] & !this.respawnFlag) { // R
			this.respawnFlag = true;
			if (!this.alive || game.state == "replay")
				this.respawn();

			if (keys[16]) { // Shift + R
				this.respawn();
			}
		} else {
			this.respawnFlag = false;
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
				this.thrust = this.maxThrust;//Math.min(this.maxThrust, this.thrust + this.thrustSpeed * delta / 16);
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
			playerHeading.sub(util.getScreenPos(game.rocket.pos, camera.zoom, camera.pos));

			// Normalize the direction
			playerHeading.normalize();
			let playerAngle = Math.atan2(playerHeading.y, playerHeading.x);

			var missileData = {
				pos: bulletPos,
				vel: this.vel.copy(),
				acc: new Vector(),
				heading: playerHeading,
				angle: playerAngle,
				speed: 1.5,
				time: Date.now(),
				id: socket.id,
				origin: "player",
				type: "laser",
				damage: 5
			}

			game.missiles.push(missileData)
			this.newMissiles.push(missileData)
		}

		// Next stage
		let stageXp = game.map.stage*100+100;
 		let xpProgress = Math.min((game.rocket.xp/stageXp), 1);
		if (keys[32] && xpProgress >= 1) {
			socket.emit('nextLevel');
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
    		if (util.dist(p.pos, this.pos)-p.radius < closestDistance) {
    			closestDistance = util.dist(p.pos, this.pos) - p.radius - this.height/2;
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
			this.angle = this.angle % (2 * Math.PI)
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

		// Gravitational force outside the map
		let distMapBorder = this.pos.getMag() - game.map.mapRadius
		if (distMapBorder > 0) {
			let pullForce = this.pos.copy();
			pullForce.normalize();
			pullForce.mult(-1 * 500 * distMapBorder/100);
			gravForce.add(pullForce);
		}

		// The force is with you
		this.gForce = gravForce.getMag()/433;
		if (this.gForce == NaN)
			this.gForce = 0;
		let netForce = thrustForce.copy();
		netForce.add(gravForce);
		this.acc = netForce.copy();
		this.acc.div(this.mass);
		this.vel.add(this.acc);

		// Constrain the speed
		this.speed = this.vel.getMag(); // Get speed in pixels per second
		if (this.speed > this.maxSpeed) { // Constrain to max speed
			this.vel.normalize();
			this.vel.mult(this.maxSpeed);
		}
		if (this.closestPlanetDistance < 200 && this.closestPlanet && this.closestPlanet.name != "Black Hole") { // Add air resistance
			this.vel.setMag(this.vel.getMag() - delta/50)
		}

		// New position
		this.pos.add(Vector.mult(this.vel, delta/1000));
	}

	updateVitals() {

		if (!game.map)
			return;

		// Update fuel
		let newFuel = this.fuel - (Math.abs(this.thrust) + Math.abs(this.steer)*200) * delta / 1000 * this.fuelConsumption;
		this.fuel = util.constrain(newFuel, 0, this.maxFuel);

		// Update integrity outside of map
		if (this.alive && this.pos.getMag() > game.map.mapRadius && Date.now()-this.deathTick > 250) {
			this.deathTick = Date.now();
			this.integrity -= 1;
			vfx.add(this.pos, "damage", {size: 20, alpha: 1, duration: 1000, text: -1, color: "red"}, false, false)
		}

		// Update closest planet distance
		this.closestPlanetDistance = Math.max(0, this.getClosestPlanet(game.screen.planets));

		// Check for death conditions
		if (this.fuel <= 0) {
			if(this.alive) {
				this.death("fuel");
				this.lives -= 1;
			}
			this.alive = false;
			this.thrust = 0;

		}

		if (this.integrity <= 0) {
			if(this.alive) {
				if (this.pos.getMag() > game.map.mapRadius) {
					this.death("edge");
				} else {
					this.death("death");
				}
				this.thrust = 0;
			}
			this.alive = false;
		}

		if (Date.now() - this.deathTick > this.respawnTime && !this.alive) {
			this.respawn();
		}
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
			if (!util.circleCollidesRect(p, this)) 
				continue;
				
			// Resolve collision
			let displacement = Vector.sub(this.pos, p.pos);
			let angle = Math.atan2(displacement.y, displacement.x);
			let x = angle;
			let y = (this.angle-Math.PI/2);
			let angleDiff = Math.atan2(Math.sin(x-y), Math.cos(x-y));
			this.goodLanding = Math.abs(angleDiff) < 0.5 || Math.abs(2*Math.PI-angleDiff) < 0.5;

			this.pos = this.prevPos.copy(); // Set position as one from previous frame
			this.vel = new Vector(); // Velocity becomes 0
			this.angularVelocity = 0; // Angular velocity becomes 0

			// Check if rocket is still in planet
			if (util.circleCollidesRect(p, this)) {
				// Perform rocket repel
				displacement.normalize();
				displacement.mult(delta/20);
				this.pos.add(displacement);
			}

			if (this.speed > this.landingSpeed || !this.goodLanding) {
				// High velocity or wrong landing
				if (this.alive) {
					this.death("crash");
					vfx.add(this.pos, "explosion", {size: 100, alpha: 1, duration: 200}, false, false)
					vfx.add(this.pos, "damage", {size: 30, alpha: 1, duration: 1000, text: -Math.round(this.integrity), color: "red"}, false, false)
				}
				this.alive = false;
			} else {
				// Perfect landing or Good landing
				this.fuel = util.constrain(this.fuel + delta * 10, 0, this.maxFuel);
				this.integrity = util.constrain(this.integrity + delta / 1000, 0, this.maxIntegrity);

				this.angle = angle+Math.PI/2;
				this.steer = 0;
				this.onPlanet = true;
			}
		}

		// Auto steer to land the rocket
		let p = this.closestPlanet;
		if (p) {
			let inVicinity = util.getDistance(this.pos, p.pos) < p.radius + 300;

			if (inVicinity) {
				// Auto rotate rocket
				let displacement = Vector.sub(this.pos, p.pos);
				let angle = Math.atan2(displacement.y, displacement.x);
				let x = angle;
				let y = (this.angle-Math.PI/2);
				let angleDiff = Math.atan2(Math.sin(x-y), Math.cos(x-y));

				let velAngle = Math.atan2(this.vel.y, this.vel.x)-Math.PI/2;
				let velDiff = Math.atan2(Math.sin(angle-velAngle), Math.cos(angle-velAngle));

				// Check if user is not manually controlling the rocket, the angle difference is greater than normal, and if the rocket is heading towards the planet
				if (this.steer == 0 && Math.abs(angleDiff) > 0.1 && velDiff < 0 && this.thrust == 0) {
					this.angle += Math.sign(angleDiff) * this.steerSpeed / Math.PI * delta / 300;
					this.angle = this.angle % (2 * Math.PI)
				}
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
	        	let collision = util.inRadialView(Vector.copy(planet.pos), Vector.add(heading, this.pos), this.pos.copy(), planet.radius);

	        	if (collision && this.vel.getMag() > this.landingSpeed - 100) {
	        		this.mortalCourse = util.getDistance(planet.pos, this.pos) - planet.radius;
	        	}
	        }
        }	
	}


	endGame() {
		// Backwards warp animation
		camera.warp = true;
		camera.backWarp = true;

		// Hide the dashboard
		$("#minimap-container").hide();
		$("#interface-container").hide();
	}

	death(event) {
		let _this = this;
		let _event = event;
		this.replayId = setTimeout(function () {
			replay.start(_event, _this);
		}, 2000)


		this.deathTick = Date.now();
		
		game.sendLog(event);
		this.lives -= 1;
	}

	respawn() {

		if (!game.map)
			return;

		if (game.rocket.lives <= 0) {
			this.endGame();
		}

		camera.zoom = camera.minZoom;

		if (game.state == "replay") 
			replay.end();
		else
			clearTimeout(this.replayId)

		// Spawn in a random location
		this.angle = util.random(0, Math.PI*2);
		let notSpawned = true;
		while (notSpawned) {
			this.pos = util.randCircle(2000);

			// Offset the star to make sure it stays the same
			camera.starOffset = Vector.add(Vector.add(this.pos, camera.offset), Vector.sub(camera.starOffset, camera.pos.copy()));
			let collidedWithAnything = false;
			for (let id in game.map.planets) {
				let p = game.map.planets[id]
				if (util.circleCollidesRect(p, this)) {
					collidedWithAnything = true;
				}
			}

			if (!collidedWithAnything) {
				notSpawned = false;
			}
		}

		// Update rocket 
		this.vel = new Vector();
		this.acc = new Vector();
		this.alive = true;
		this.steer = 0;
		this.fuel = this.maxFuel;
		this.integrity = this.maxIntegrity;

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
		let zoom = camera.zoom;

		let width = (player.width || rocket.width) * zoom;
		let height = (player.height || rocket.height) * zoom;
		let pos = util.getScreenPos(player.pos, zoom, camera.pos);

		if (serverRocket) {
			Rocket.addParticles(player);
			pos = util.getScreenPos(player.pos, zoom, camera.pos);
		}

		// Draw particle
		if (showParticles) {
			Rocket.animateParticles(player, serverRocket);
		}

		// Check if rocket is in the screen
		if (!inScreen(player.pos, 1, 20, camera.pos))
			return;

		// Draw body
        util.drawRect(pos.x, pos.y, width, height, player.angle, "#d3d3d3");
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(player.angle);

        // Set your mom
        let halfWidth = width/2;
        let halfHeight = height/2;

        // Draw thruster flame
        if (player.thrust > 0) {
        	let thrustLength = scale(player.thrust/rocket.maxThrust, 0, 1, 0.2, 1.5);
	       	util.drawTriangle(halfWidth, width*2 + (width*thrustLength / 2), width/3, width*thrustLength, Math.PI, "orange");
	        util.drawTriangle(-halfWidth, width*2 + (width*thrustLength / 2), width/3, width*thrustLength, Math.PI, "orange");
        }

        // Draw thrusters
        util.drawRect(-halfWidth, halfHeight, halfWidth, width, 0, player.color || "red");
        util.drawRect(halfWidth, halfHeight, halfWidth, width, 0, player.color || "red");

        // Draw nose cone
        util.drawTriangle(0, -halfHeight - halfWidth, width, width, 0, player.color || "red");

        // Draw player window
        util.drawRoundedRect(0-width/4, -width, halfWidth, width, 3*zoom, "rgb(70, 70, 70)")

        // Draw thruster caps
        util.drawTriangle(halfWidth, width/1.33, halfWidth, halfWidth, 0, player.color || "red");
        util.drawTriangle(-halfWidth, width/1.33, halfWidth, halfWidth, 0, player.color || "red");

        // Draw body accent
        util.drawTriangle(0, height/4, width/1.5, -width/1.5, 0, pSBC(-0.05, pSBC(Math.max(-(1-(player.integrity/100)), -1), "#d3d3d3", false, true), false, true));

        ctx.restore();
        
        // Draw player usernames
        if(serverRocket && !camera.warp)
        	util.drawText(name, pos.x, pos.y - height*1.2, 20+ "px Arial", "white", "center", "middle", 1);
    
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
		let zoom = camera.zoom;
		let rocket = game.rocket;
		let smoke = images.smoke;
		let smokeDuration = 500;

		if (!smoke || !player.particles)
			return;

		let pos = getScreenPos(player.pos, zoom, camera.pos);

		for (let i = 0; i < player.particles.length; i++) {
			let p = player.particles[i];
        	if (p.type == "smoke" && inScreen(p, 1, 20, camera.pos)) {
        		let size = rocket.width * random(1, 1.5);
				let particle = getScreenPos(p, zoom, camera.pos);
	        	ctx.globalAlpha = util.constrain(1-(Date.now()-p.time)/smokeDuration, 0, 1);
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