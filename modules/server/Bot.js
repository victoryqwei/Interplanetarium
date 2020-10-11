/*

	THE RISE OF FAKE MULTIPLAYER

*/

var Vector = require('../util/Vector.js');
var Planet = require('../world/Planet.js');
var Turret = require('../world/Turret.js')
var Base = require('../world/Base.js')
var Util = require('../util/Util.js');
var {QuadTree, Rectangle, Point, Circle} = require('../util/QuadTree.js');

module.exports = class Bot {
	constructor(id, spawnRadius) {
		this.id = id;
		this.name = "Bot" + Util.randInt(1000, 9999);
		this.type = "bot";
		this.stage = 0;
		this.rocket = {
			pos: Util.randCircle(spawnRadius),
			vel: new Vector(),
			acc: new Vector(),
			angle: 0,
			integrity: 100,
			xp: 0,
			alive: true,
			height: 60,
			width: 20,
			mass: 100,
		}
	}

	update(map) {

		/*this.updateScreen(map);
		this.getClosestPlanet(map.planets);
		this.move(map);
		this.collision(map);*/

	}

	updateScreen(map) {
		if (!map.qtree)
			return;

		let rocket = this.rocket;

		// Update the objects that are in the screen
		this.screen = {
			planets: {},
			players: {}
		}

		// Update screen objects
		let range = new Rectangle(rocket.pos.x, rocket.pos.y, 1920, 1080);
		let points = map.qtree.query(range);

		for (let p of points) {
			if (!map.planets[p.data.id])
				continue;

			if (p.data instanceof Planet) {
				this.screen.planets[p.data.id] = p.data;
			}
		}
	}
	
	attract(planet) {
		let rocket = this.rocket;

		// Get force from rocket to planet
    	var force = new Vector(planet.pos.x, planet.pos.y);
    	force.sub(rocket.pos);
	    var distance = force.getMag();
	    force.normalize();
	    var strength = (1 * rocket.mass * planet.mass) / (distance * distance);
	    force.mult(strength);

	    return force;
    }

    getClosestPlanet(planets) {
    	let rocket = this.rocket;

    	// Get the closest planet from the rocket
    	let closestDistance = Infinity;
    	for (let id in planets) {
    		let p = planets[id];
    		if (Util.dist(p.pos, rocket.pos)-p.radius < closestDistance) {
    			closestDistance = Util.dist(p.pos, rocket.pos) - p.radius - rocket.height/2;
    			rocket.angleFromPlanet = Math.atan2(p.pos.y-rocket.pos.y, p.pos.x-rocket.pos.x)/Math.PI*180;
    			rocket.closestPlanet = p;
    		}
    	}

    	return closestDistance;
    }

	move(map) {
		let rocket = this.rocket;
		let delta = 30;

		rocket.prevPos = rocket.pos.copy(); // Previous pos

		if (!rocket.onPlanet) {
			rocket.angle += rocket.steer * rocket.steerSpeed / Math.PI * delta / 300;
			rocket.angle = rocket.angle % (2 * Math.PI)
		}

		// Get direction of rocket
		rocket.heading = Vector.rotate(new Vector(0, -1), rocket.angle);
		let thrustForce = rocket.heading.copy();
		thrustForce.mult(rocket.thrust);

		// Gravitational force
		let gravForce = new Vector();
		for (let id in map.planets) {
			let p = map.planets[id];
			gravForce.add(this.attract(p));
		}

		// Gravitational force outside the map
		let distMapBorder = rocket.pos.getMag() - map.mapRadius
		if (distMapBorder > 0) {
			let pullForce = rocket.pos.copy();
			pullForce.normalize();
			pullForce.mult(-1 * 500 * distMapBorder/100);
			gravForce.add(pullForce);
		}

		// The force is with you
		rocket.gForce = gravForce.getMag()/433;
		if (rocket.gForce == NaN)
			rocket.gForce = 0;
		let netForce = thrustForce.copy();
		netForce.add(gravForce);
		rocket.acc = netForce.copy();
		rocket.acc.div(rocket.mass);
		rocket.vel.add(rocket.acc);

		// Constrain the speed
		rocket.speed = rocket.vel.getMag(); // Get speed in pixels per second
		if (rocket.speed > rocket.maxSpeed) { // Constrain to max speed
			rocket.vel.normalize();
			rocket.vel.mult(rocket.maxSpeed);
		}
		if (rocket.closestPlanetDistance < 200 && rocket.closestPlanet && rocket.closestPlanet.name != "Black Hole") { // Add air resistance
			rocket.vel.setMag(rocket.vel.getMag() - delta/50)
		}

		// New position
		rocket.pos.add(Vector.mult(rocket.vel, delta/1000));
	}

	collision(map) {

		if (!map)
			return;

		let planets = this.screen.planets;
		if (!planets) // No planets in vicinity, return
			return;

		let rocket = this.rocket;

		this.onPlanet = false;
		for (let id in planets) {
			let p = planets[id];

			// Crash detection
			if (!Util.circleCollidesRect(p, rocket)) 
				continue;
				
			// Resolve collision
			let displacement = Vector.sub(rocket.pos, p.pos);
			let angle = Math.atan2(displacement.y, displacement.x);
			let x = angle;
			let y = (rocket.angle-Math.PI/2);
			let angleDiff = Math.atan2(Math.sin(x-y), Math.cos(x-y));
			rocket.goodLanding = Math.abs(angleDiff) < 0.5 || Math.abs(2*Math.PI-angleDiff) < 0.5;

			rocket.pos = rocket.prevPos.copy(); // Set position as one from previous frame
			rocket.vel = new Vector(); // Velocity becomes 0
			rocket.angularVelocity = 0; // Angular velocity becomes 0

			// Check if rocket is still in planet
			if (Util.circleCollidesRect(p, rocket)) {
				// Perform rocket repel
				displacement.normalize();
				displacement.mult(delta/20);
				rocket.pos.add(displacement);
			}

			if (rocket.speed > rocket.landingSpeed || !rocket.goodLanding) {
				// High velocity or wrong landing
				if (rocket.alive) {
					rocket.death("crash");
					vfx.add(rocket.pos, "explosion", {size: 100, alpha: 1, duration: 200}, false, false)
					vfx.add(rocket.pos, "damage", {size: 30, alpha: 1, duration: 1000, text: -Math.round(rocket.integrity), color: "red"}, false, false)
				}
				rocket.alive = false;
			} else {
				// Perfect landing or Good landing
				rocket.fuel = Util.constrain(rocket.fuel + delta * 10, 0, rocket.maxFuel);
				rocket.integrity = Util.constrain(rocket.integrity + delta / 1000, 0, rocket.maxIntegrity);

				rocket.angle = angle+Math.PI/2;
				rocket.steer = 0;
				rocket.onPlanet = true;
			}
		}

		/*// Auto steer to land the rocket
		let p = rocket.closestPlanet;
		if (p) {
			let inVicinity = Util.getDistance(rocket.pos, p.pos) < p.radius + 300;

			if (inVicinity) {
				// Auto rotate rocket
				let displacement = Vector.sub(rocket.pos, p.pos);
				let angle = Math.atan2(displacement.y, displacement.x);
				let x = angle;
				let y = (rocket.angle-Math.PI/2);
				let angleDiff = Math.atan2(Math.sin(x-y), Math.cos(x-y));

				let velAngle = Math.atan2(rocket.vel.y, rocket.vel.x)-Math.PI/2;
				let velDiff = Math.atan2(Math.sin(angle-velAngle), Math.cos(angle-velAngle));

				// Check if user is not manually controlling the rocket, the angle difference is greater than normal, and if the rocket is heading towards the planet
				if (rocket.steer == 0 && Math.abs(angleDiff) > 0.1 && velDiff < 0 && rocket.thrust == 0) {
					rocket.angle += Math.sign(angleDiff) * rocket.steerSpeed / Math.PI * delta / 300;
					rocket.angle = rocket.angle % (2 * Math.PI)
				}
			}
		}	*/
	}
}