var Vector = require('./Vector.js');

module.exports = class Rocket {
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

		//this.drill = new Drill(1);

		// Forces
		this.thrust = 0;
		this.steer = 0;
		this.gForce = 0; // Gravitational pull

		// Fuel
		this.fuel = 0;
		this.oxygen = 0;

		this.crashed = false;

		// Extra data
		this.closestPlanetDistance = 0;
		this.closestPlanet = undefined;

		this.resources = {Iron: 0, Copper: 0, Kanium: 0, Lead: 0};

		let config = {
			width: width,
			height: height
		}

		this.setConfig(config);

		this.welcome = false;
		this.thrustToggle = false;
		this.thrustSelect = true;

	}

	setConfig(cfg) {
		if (!cfg) cfg = {};

		this.height = cfg.height || 80;
		this.width = cfg.width || 20;

		this.maxSpeed = cfg.maxSpeed || Infinity;
		this.landingSpeed = cfg.landingSpeed || 250;

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
	}

	input() {	
		// Respawn
		if (keys[82]) { // R
			if (this.crashed || this.fuel <= 0 || this.oxygen <= 0) {
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
			if (this.closestPlanetDistance > 5) {
				if (keys[37] || keys[65]) {
					this.steer = -1;
				} else if (keys[39] || keys[68]) {
					this.steer = 1;
				} else {
					this.steer = 0;
				}
			}

			// Check if there's still fuel
			if (this.fuel > 0 ) {
				// Thrust
				if (keys[38] || keys[87]) {
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

		if(this.thrst <= 0) {
			this.thrust = 0;
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
    	for (let p of planets) {
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
		for (let p of planets) {
			gravForce.add(this.attract(p));
		}
		this.gForce = gravForce.getMag();

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

		// Extra data
		this.closestPlanetDistance = Math.max(0, this.getClosestPlanet(planets));
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

	collision() {
		this.onPlanet = false;
		for (let i = 0; i < planets.length; i++) {
			let p = planets[i];

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
					// Proper landing
					this.fuel = constrain(this.fuel + delta * 10, 0, this.maxFuel);
					this.angle = angle+Math.PI/2;
					this.steer = 0;

					// Mine resources
					if (p.resource.amount > 0 && p.resource.type != "None") {
						// Decrease resource on planet and increase resource gained from player
						p.resource.amount = Math.max(
							p.resource.amount-this.miningSpeed*delta, 
							0
						);
						let resourceType = p.resource.type;
						rocket.resources[resourceType] = Math.max(
							rocket.resources[resourceType]+this.miningSpeed*delta, 
							0
						);

						// Change planet properties
						let lastRadius = p.radius;
						p.radius = p.maxRadius * (p.resource.amount/p.resource.totalAmount);
						p.mass = p.maxMass * (Math.pow(p.radius, 2)/Math.pow(p.maxRadius, 2));
						p.color = pSBC(-(1-(p.resource.amount/p.resource.totalAmount)), p.maxColor, false, true)
						p.strokeColor = pSBC(-(1-(p.resource.amount/p.resource.totalAmount)), p.maxStrokeColor, false, true)

						// Change player position to new planet radius
						let deltaRadius = lastRadius-p.radius;
						let deltaPos = new Vector(0, 1);
						deltaPos = Vector.rotate(deltaPos, angle+Math.PI/2);
						deltaPos.mult(deltaRadius);
						this.pos.add(deltaPos);
					}
				}

				//Preview welcome 
				if(!this.welcome && !this.crashed) {
					animateTitle(
						"Welcome to " + p.name,
						"You have landed, you can now mine and refuel.",
						3000
					);
				}			
			}

			// Destroy when planet becomes too small
			if(p.mass < 10000) {
				p.resource.amount = p.resource.amount-0.05*delta;
			}

			// When resources of the planet are depleted, destroy the planet
			if(p.resource.amount <= 0) {
				planets.splice(i, 1);
			}
		}

		//Change welcome value
		if(this.onPlanet == true) {
			this.welcome = true;
		} else if(this.closestPlanetDistance > this.closestPlanet.radius + 10) {
			this.welcome = false;
		}
	}

	respawn() {
		this.pos.x = 0;
		this.pos.y = 0;

		this.vel.x = 0;
		this.vel.y = 0;

		this.acc.x = 0;
		this.acc.y = 0;

		this.crashed = false;
		this.angle = 0;
		this.steer = 0;

		this.fuel = this.maxFuel;
		this.oxygen = this.maxOxygen;

		for (var i = 0; i < planets.length; i++) {
			planets[i].resource.amount = planets[i].resource.totalAmount;
		}

		for (var i = 0; i < resourceTypes.length; i++) {
			rocket.resources[resourceTypes[i]] = 0;
		}
	}

	update() {
		this.input();

		if (!this.crashed) {
			this.move();
			this.updateEssentials();
			this.addParticles();
			this.collision();
		}
	}
}