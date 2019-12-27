class Rocket {
	constructor(x, y, mass, width, height) {
		// Positional data
		this.pos = new Vector(x, y);
		this.spawnPos = new Vector();
		this.prevPos = new Vector();
		this.vel = new Vector();
		this.acc = new Vector();

		this.speed = 0;

		// Orientation data
		this.heading = new Vector(1, 0);
		this.angle = 0;
		this.angularVelocity = 0;
		this.angleFromPlanet = 0;

		this.drill = new Drill(1);

		// Forces
		this.thrust = 0;
		this.steer = 0;
		this.gForce = 0; // Gravitational pull

		// Fuel
		this.fuel = 0;
		this.oxygen = 0;

		// Rocket integrity
		this.integrity = 100;
		this.maxIntegrity = this.integrity;

		// Resource inventory
		this.level = 1;
		this.resources = {Iron: 0, Copper: 0, Kanium: 0, Lead: 0};

		// Extra data
		this.closestPlanetDistance = 0;
		this.closestPlanet = undefined;

		this.crashed = false;

		// Projectiles
		this.tShoot = 0;

		// Set config
		let config = {
			width: width,
			height: height
		}

		this.setConfig(config);

		// Particles
		this.particlesMax = 200;
		this.particles = [];

		// Parts (when the rocket crashes or gets destroyed)

		this.parts = [];

		this.welcome = false;
		this.thrustToggle = false;
		this.thrustSelect = true;

		this.showRocket = false;

		this.name = "Player";
		this.color = "red";

		
		this.statistics = {
			speed: 10,
			resistance: 20,
			damage: 1
		}
	}

	setConfig(cfg) {
		if (!cfg) cfg = {};

		this.height = cfg.height || 80;
		this.width = cfg.width || 20;

		this.maxSpeed = cfg.maxSpeed || Infinity;
		this.landingSpeed = cfg.landingSpeed || 600;

		this.mass = cfg.mass || 100;
		this.maxThrust = cfg.maxThrust || 1000;
		this.thrustSpeed = cfg.thrustSpeed || this.maxThrust/100;

		this.steerSpeed = cfg.steerSpeed || 3;

		// Fuel
		this.maxFuel = cfg.maxFuel || 100000;
		this.fuel = this.maxFuel;
		this.fuelConsumption = cfg.fuelConsumption || 5;

		// Oxygen
		this.maxOxygen = cfg.maxOxygen || 1000;
		this.oxygen = this.maxOxygen;
		this.oxygenConsumption = cfg.oxygenConsumption || 20;

		// Mining
		this.miningSpeed = cfg.miningSpeed || 0.01;

		// Shooting
		this.cooldown = 10;

		// Controls
		this.controlType = "mouse" // Or "keyboard"
	}

	input() {
		/*
			
			Controls

		*/
		// Mouse setup
		let angle = mouse.copy();
		angle.sub(new Vector(canvas.width/2, canvas.height/2));
		
		// Respawn
		if (keys[82]) { // R
			if (this.crashed || this.fuel <= 0 || this.oxygen <= 0 || this.integrity <= 0) {
				this.respawn();
			}

			if (keys[16]) // Shift + R
				this.respawn();
		}

		// Hold thrust
		if(keys[84]) { // insert
			if(this.thrustToggle === false) {
				this.thrustToggle = true;
				this.thrustSelect = !this.thrustSelect;
			}

		} else {
			if (this.thrustToggle) {
				this.thrustToggle = false;
			}
		}

		// Check if there's still oxygen
		if (this.oxygen > 0) {
			// Steering
			if (this.closestPlanetDistance > 5 && this.fuel > 0 && !this.crashed && this.integrity > 0) { // Make sure you don't steer while on planet
				this.angle = Math.atan2(angle.y, angle.x)+Math.PI/2;
				if (keys[37] || keys[65]) {
					this.steer = -1;
				} else if (keys[39] || keys[68]) {
					this.steer = 1;
				} else {
					this.steer = 0;
				}
			}

			// Shooting
			if (mouse.down && this.tShoot <= 0 && !this.crashed && this.integrity > 0) { // Make this server side by only sending the key input, or do client prediction
				let projectileData = {
					pos: this.pos.copy(), // Just remove the .copy() so the rocket becomes a projectile lmao
					vel: this.vel.copy(),
					heading: this.heading,
					angle: this.angle+Math.PI/2,
					speed: 1,
					time: Date.now(),
					id: socket.id, // So we don't get server projectile
					type: "player"
				}

				socket.emit('projectile', projectileData)

				projectiles.push(projectileData);
				this.tShoot = this.cooldown;
			}

			this.tShoot -= 1;

			// Check if there's still fuel
			if (this.fuel > 0 && !this.crashed && this.integrity > 0) {
				// Thrust
				if (keys[38] || keys[87] || keys[32]) {
					this.thrust = Math.min(this.maxThrust, this.thrust + this.thrustSpeed * delta / 16);
				} else if(keys[33]) { // Instant thrust? page down
					this.thrust = 500;
				} else if (keys[40] || keys[83]) { // Deceleration
					if(!this.thrustSelect) {
						this.thrust = Math.max(0, this.thrust - this.thrustSpeed * delta / 16)
					}
				} else {
					if(this.thrustSelect) {
						this.thrust = 0;
					}
				}
			} else {
				this.thrust = 0;
			}
		}
	}

	attract(planet) {
		// Get force from rocket to planet
    	var force = planet.pos.copy();
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
		this.prevPos = this.pos.copy(); // Previous pos

		if (!this.onPlanet) {
			this.angle += this.steer * this.steerSpeed / Math.PI * delta / 300;
		}

		this.heading = Vector.rotate(new Vector(0, -1), this.angle);

		// Thrust from rocket
		let thrustForce = this.heading.copy();
		thrustForce.mult(this.thrust);

		// Gravitational force
		let gravForce = new Vector();
		for (let id in planets) {
			let p = planets[id];
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

	updateEssentials() {
		// Update fuel
		let newFuel = this.fuel - (Math.abs(this.thrust) + Math.abs(this.steer)*200) * delta / 1000 * this.fuelConsumption;
		this.fuel = constrain(newFuel, 0, this.maxFuel);
		if (this.fuel <= 0) {
			this.thrust = 0;
		}

		// Update oxygen
		if (this.closestPlanetDistance > 50) {
			let newOxygen = this.oxygen - delta / 1000 * this.oxygenConsumption;
			this.oxygen = constrain(newOxygen, 0, this.maxOxygen);
		} else {
			let newOxygen = this.oxygen + delta / 4;
			this.oxygen = constrain(newOxygen, 0, this.maxOxygen);
		}
	}

	harvest(p, angle) {
		// Change planet properties
		let lastRadius = p.radius;

		// Change player position to new planet radius
		let deltaRadius = lastRadius-p.radius;
		let deltaPos = new Vector(0, 1);
		deltaPos = Vector.rotate(deltaPos, angle+Math.PI/2);
		deltaPos.mult(deltaRadius);
		this.pos.add(deltaPos);
	}

	collision() {
		this.onPlanet = false;
		for (let id in planets) {
			let p = planets[id];

			if (circleCollidesRect(p, this)) {
				// Crash detection

				let displacement = Vector.sub(this.pos, p.pos);
				let angle = Math.atan2(displacement.y, displacement.x);
				let angleDiff = (angle - (this.angle-Math.PI/2))%(Math.PI*2);
				this.goodLanding = Math.abs(angleDiff) < 0.5 || Math.abs(2*Math.PI-angleDiff) < 0.5;

				// Set position as one from previous frame
				this.pos.x = this.prevPos.x;
				this.pos.y = this.prevPos.y;

				// Velocity becomes 0
				this.vel.x = 0;
				this.vel.y = 0;
				this.onPlanet = true;

				// Angular velocity becomes 0
				this.angularVelocity = 0;

				// Check if rocket is still in planet
				if (circleCollidesRect(p, this)) {
					// Perform rocket repel
					displacement.normalize();
					displacement.mult(delta/20);
					this.pos.x += displacement.x;
					this.pos.y += displacement.y;
				}

				if (this.speed > this.landingSpeed || !this.goodLanding) {
					// High velocity or wrong landing
					this.crashed = true;
				} else {
					// Perfect landing or Good landing
					this.fuel = constrain(this.fuel + delta * 10, 0, this.maxFuel);
					this.angle = angle+Math.PI/2;
					this.steer = 0;

					// Mine resources
					if (p.resource.amount > 0 && p.resource.type != "None") {
						this.harvest(p, angle);
					}
				}

				//Preview welcome
				if(!this.welcome && !this.crashed) {
					ui.animateTitle(
						"Welcome to " + p.name,
						"You have landed, you can now mine and refuel.",
						3000,
						function () {
							ui.onTitle = false;
							ui.titleText = "";
							ui.descriptorText = "";
						}
					);
				}
			}

			// Destroy when planet becomes too small
			if(p.mass < 10000) {
				p.resource.amount = p.resource.amount-0.05*delta;
			}
		}

		//Change welcome value
		if(this.onPlanet) {
			this.welcome = true;
		} else if(this.closestPlanetDistance > this.closestPlanet.radius + 10) {
			this.welcome = false;
		}
	}

	respawn() {
		this.showRocket = false;

		/*// Spawn on Earth
		let spawnVector = Vector.rotate(new Vector(0, -200), random(0, Math.PI*2));
		this.pos = new Vector(spawnVector.x, 200+spawnVector.y);
		this.angle = Math.atan2(spawnVector.y, spawnVector.x)+Math.PI/2;*/
		// Spawn in a random location
		display.zoom = 0.5;
		this.angle = random(0, Math.PI*2);
		let notSpawned = true;
		while (notSpawned) {
			this.pos = randCircle(2000);
			let collidedWithAnything = false;
			for (let id in planets) {
				let p = planets[id]
				if(circleCollidesRect(p, this)) {
					collidedWithAnything = true;
				}
			}

			if (!collidedWithAnything) {
				notSpawned = false;
			}
		}

		this.vel.x = 0;
		this.vel.y = 0;

		this.acc.x = 0;
		this.acc.y = 0;

		this.crashed = false;
		this.steer = 0;

		this.fuel = this.maxFuel;
		this.oxygen = this.maxOxygen;

		this.integrity = this.maxIntegrity;

		for (var i = 0; i < resourceTypes.length; i++) {
			this.resources[resourceTypes[i]] = 0;
		}

		socket.emit("respawn", '');

		// Animation
		
		animateSpawn(this.pos.x, this.pos.y, 50);
	}

	update() {
		if (this.showRocket)
			this.input();
		
		if (!this.crashed && Object.keys(planets).length > 0) {
			// Extra data
			this.closestPlanetDistance = Math.max(0, this.getClosestPlanet(planets));

			this.move();
			this.updateEssentials();
			Rocket.addParticles(this);
			this.collision();
		}
	}

	static addParticles(player) {
		// Particles
		if (player.thrust > 0) {
			let maxParticles = 1; // Change particles based on the FPS
			let thrustRatio = player.thrust/player.maxThrust;

			var thrusterPos = new Vector(player.pos.x, player.pos.y);
			var rocketHeading = new Vector(player.heading.x, player.heading.y);
			rocketHeading.mult(-player.height/2-player.width/2);
			thrusterPos.add(rocketHeading);
			var rocketHeading = new Vector(player.heading.x, player.heading.y);
			rocketHeading.mult(player.width/2);
			rocketHeading = Vector.rotate(rocketHeading, -90);
			thrusterPos.add(rocketHeading);

			var thrusterPos2 = new Vector(player.prevPos.x, player.prevPos.y);
			var rocketHeading2 = new Vector(player.heading.x, player.heading.y);
			rocketHeading2.mult(-player.height/2-player.width/2);
			thrusterPos2.add(rocketHeading2);
			var rocketHeading2 = new Vector(player.heading.x, player.heading.y);
			rocketHeading2.mult(player.width/2);
			rocketHeading2 = Vector.rotate(rocketHeading2, -90);
			thrusterPos2.add(rocketHeading2);

			for (var i = 0; i < thrustRatio*maxParticles; i++) {
				let randomPoint = interpolate(thrusterPos, thrusterPos2, Math.random());
				// Add smoke particles
				let smokeOffset = player.width/2;
				let fireOffset = player.width/3;

				let smokeParticle = new Vector(
					randomPoint.x+random(smokeOffset, -smokeOffset),
					randomPoint.y+random(smokeOffset, -smokeOffset)
				);

				smokeParticle.time = Date.now();
				smokeParticle.type = "smoke";
				player.particles.push(smokeParticle);

				// Add fire particles
				for (var j = 0; j < 2; j++) {
					let fireParticle = new Vector(
						randomPoint.x + randn_bm(),
						randomPoint.y + randn_bm()
					);
					fireParticle.time = Date.now();
					fireParticle.type = "fire";
					player.particles.push(fireParticle);
				}
			}

			var thrusterPos = new Vector(player.pos.x, player.pos.y);
			var rocketHeading = new Vector(player.heading.x, player.heading.y);
			rocketHeading.mult(-player.height/2-player.width/2);
			thrusterPos.add(rocketHeading);
			var rocketHeading = new Vector(player.heading.x, player.heading.y);
			rocketHeading.mult(player.width/2);
			rocketHeading = Vector.rotate(rocketHeading, 90);
			thrusterPos.add(rocketHeading);

			var thrusterPos2 = new Vector(player.prevPos.x, player.prevPos.y);
			var rocketHeading2 = new Vector(player.heading.x, player.heading.y);
			rocketHeading2.mult(-player.height/2-player.width/2);
			thrusterPos2.add(rocketHeading2);
			var rocketHeading2 = new Vector(player.heading.x, player.heading.y);
			rocketHeading2.mult(player.width/2);
			rocketHeading2 = Vector.rotate(rocketHeading2, 90);
			thrusterPos2.add(rocketHeading2);

			for (var i = 0; i < thrustRatio*maxParticles; i++) {
				let randomPoint = interpolate(thrusterPos, thrusterPos2, Math.random());
				// Add smoke particles
				let smokeOffset = player.width/2;
				let fireOffset = player.width/3;

				let smokeParticle = new Vector(
					randomPoint.x+random(smokeOffset, -smokeOffset),
					randomPoint.y+random(smokeOffset, -smokeOffset)
				);

				smokeParticle.time = Date.now();
				smokeParticle.type = "smoke";
				player.particles.push(smokeParticle);

				// Add fire particles
				for (var j = 0; j < 2; j++) {
					let fireParticle = new Vector(
						randomPoint.x + randn_bm(),
						randomPoint.y + randn_bm()
					);
					fireParticle.time = Date.now();
					fireParticle.type = "fire";
					player.particles.push(fireParticle);
				}
			}
		}
	}

	static drawParticles(player, serverRocket) {
		let zoom = display.zoom;
		let size = player.width;

		let pos = new Vector(canvas.width/2, canvas.height/2);
		if (serverRocket) {
			pos = getScreenPos(player.pos, display.zoom);
			pos.add(new Vector(rocket.pos.x*display.zoom, rocket.pos.y*display.zoom));
		}

		if (player.particles) {
			let smokeDuration = 1000;
			let fireDuration = 100;
			for (let i = 0; i < player.particles.length; i++) {
				let p = player.particles[i];

		        if (smoke) { // Check if image works
		        	if (p.type == "smoke" && inScreen(p, 1, 20) && !display.performanceMode) {
		        		size = player.width * random(0.5, 0.8);
			        	ctx.globalAlpha = constrain(1-(Date.now()-p.time)/smokeDuration, 0, 1);
								let particle = getScreenPos(p, zoom);
			            ctx.drawImage(smoke,
										particle.x,
										particle.y,
			            	size*zoom,
			            	size*zoom
			            );
		        	} else if (p.type == "fire" && inScreen(p, 1, 20)) {
		        		size = 2;
		        		ctx.globalAlpha = constrain(1-(Date.now()-p.time)/fireDuration, 0, 1);
								let particle = getScreenPos(p, zoom);
		        		drawRect(
									particle.x,
									particle.y,
		        			size*zoom, size*zoom,
		        			0,"orange"
		        		);
		        	}

		            ctx.globalAlpha = 1;
		            continue;
		        }
			}

			// Remove old particles
			for (let i = player.particles.length-1; i > 0; i--) {
				if (player.particles[i].type == "smoke" && Date.now()-player.particles[i].time > smokeDuration) {
		        	player.particles.splice(i, 1);
		        } else if (player.particles[i].type == "fire" && Date.now()-player.particles[i].time > fireDuration) {
		        	player.particles.splice(i, 1);
		        }
			}
		}
	}

	static display(player, serverRocket, showParticles) {
		// Draw the player
		let width = player.width * display.zoom;
		let height = player.height * display.zoom;

		let pos = new Vector(canvas.width/2, canvas.height/2);
		if (serverRocket)
			pos = getScreenPos(player.pos, display.zoom);

		// Draw particle
		if (showParticles)
			Rocket.drawParticles(player, serverRocket);

		if (inScreen(player.pos, 1, 20)) {
			// Draw body
			ctx.save();
			drawRect(pos.x, pos.y, width, height, player.angle, pSBC(Math.max(-(1-(player.integrity/100)), -1), "#d3d3d3", false, true))
			ctx.restore();

			var options = {
				alpha: 1
			}

			// Draw nose cone
			ctx.beginPath();
			ctx.save();
			ctx.translate(pos.x, pos.y);
			ctx.rotate(player.angle);
		    ctx.moveTo(-width/2, -height/2);
		    ctx.lineTo(width/2, -height/2);
		    ctx.lineTo(0, -23*display.zoom);
		    ctx.fillStyle = player.color;
		    ctx.fill();
		    ctx.restore();
		    ctx.closePath();

			// Draw player window
			ctx.save();
			ctx.translate(pos.x, pos.y);
			ctx.rotate(player.angle);
			drawRoundedRect(0-width/4, -width, width/2, width, 3*display.zoom, "rgb(70, 70, 70)", options)
			ctx.restore();

			// Draw thrusters
			ctx.save();
			ctx.translate(pos.x, pos.y);
			ctx.rotate(player.angle);
			drawRect(-width/2, height/2, width/2, width, 0, player.color)
			ctx.restore();

			ctx.save();
			ctx.translate(pos.x, pos.y);
			ctx.rotate(player.angle);
			drawRect(width/2, height/2, width/2, width, 0, player.color)
			ctx.restore();

			// Draw velocity
			/*let velocityDir = new Vector(player.vel.x, player.vel.y);
			velocityDir.normalize();
			velocityDir.mult(20);
			if(display.advanced) {
				drawArrow(pos.x, pos.y, pos.x + velocityDir.x, pos.y + velocityDir.y, 2, "lime");
			}*/
		}
	}
}
