var Vector = require('../util/Vector.js');
var Function = require('../util/Util.js');

module.exports = class Turret {
	constructor(planet, angle, level, id) {
		let spawnVector = Vector.rotate(new Vector(planet.radius, 0), angle);
		this.planetPos = planet.pos;
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);
		this.heading = spawnVector.normalize();
		this.angle = angle;
		this.radius = 30;

		this.barrelAngle = 0;
		this.barrelHeading = new Vector(1, 0);
		this.barrelShot = 0;
		this.viewRadius = 1000; // How far the turret can see
		this.level = level || 1;

		this.health = 20;
		this.id = planet.id;
		this.turretId = id;

		this.range = 1000;
		this.type = Function.randInt(0, 1) == 0 ? "laser" : "seeking"; 

		this.shootDelay = this.type == "laser" ? 1000 : 2000;
		this.shootTime = 0;
		this.bulletLifeTime = 1000;
	}

	update(planet, players, projectiles) {
		if (this.health <= 0)
			return;

		this.barrelShot += 1;

		// Update turret position
		let spawnVector = Vector.rotate(new Vector(planet.radius, 0), this.angle);
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);

		// Update outer turret tracking
		let outerVector = Vector.rotate(new Vector(planet.radius + 2, 0), this.angle);
		let outerPos = Vector.add(outerVector, planet.pos);

		// Find closest player and aim at it
		let closestDistance = Infinity;
		let closestPlayer = undefined;

		for (let id in players) {
			let p = players[id].rocket;
			if (!p)
				continue;
			let dist = Function.dist(this.pos, p.pos);

			if (dist > this.range)
				continue;
			//let playerAlive = !p.crashed && p.fuel > 0 && p.integrity > 0;

			if (Function.inRadialView(planet.pos.copy(), outerPos.copy(), new Vector(p.pos.x, p.pos.y), planet.radius) == false && p.alive) {
				if (dist < closestDistance) {
					closestDistance = dist;
					closestPlayer = p;
				}
			}
		}

		if (closestPlayer) {
			// Move the turret towards the player
			//let target = closestPlayer.pos;

			// Predict the position of the rocket
			let delta = Function.getDistance(closestPlayer.pos, this.pos) * 0.75; // Get the time of impact
			let heading = new Vector(closestPlayer.vel.x/1000*delta, closestPlayer.vel.y/1000*delta);
        	let predicted = Vector.add(heading, closestPlayer.pos);

        	// Move the position of the barrel towards the predicted position
			this.barrelHeading = new Vector(predicted.x, predicted.y);
			this.barrelHeading.sub(this.pos);
			this.barrelHeading.normalize();

			this.barrelAngle = Math.atan2(this.barrelHeading.y, this.barrelHeading.x)
		} else {
			// Move back to normal turret position
			this.barrelHeading = outerPos.copy();
			this.barrelHeading.sub(this.pos);
			this.barrelHeading.normalize();

			this.barrelAngle = Math.atan2(this.barrelHeading.y, this.barrelHeading.x)
		}

		// Shoot at the player
		if (closestPlayer && closestDistance < this.range) {
			this.shoot(projectiles);
		}
	}

	shoot(missiles) {
		if (Date.now() - this.shootTime < this.shootDelay)
			return;

		this.shootTime = Date.now();

		this.barrelShot = 0;

		let bulletPos = this.pos.copy();
		let heading = this.barrelHeading.copy();
		heading.mult(20);
		bulletPos.add(heading);

		let horizontalDisplacement = new Vector();

		if (this.level >= 2) {
			horizontalDisplacement = Vector.rotate(this.barrelHeading.copy(), Math.PI/2);
			horizontalDisplacement.mult(5);

			bulletPos.add(horizontalDisplacement);
		}

		var missileData = {
			pos: bulletPos,
			vel: new Vector(),
			acc: new Vector(),
			heading: this.barrelHeading,
			angle: this.barrelAngle,
			speed: this.type == "laser" ? 0.6 : 0.4,
			time: Date.now(),
			id: this.id,
			origin: "turret",
			type: this.type
		}

		missiles.push(missileData);
	}
}