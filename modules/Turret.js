var Vector = require('./Vector.js');
var Function = require('./Function.js');

module.exports = class Turret {
	constructor(planet, angle, level) {
		let spawnVector = Vector.rotate(new Vector(planet.radius, 0), angle);
		this.planetPos = planet.pos;
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);
		this.heading = spawnVector.normalize();
		this.angle = angle;

		this.barrelAngle = 0;
		this.barrelHeading = new Vector(1, 0);

		this.cooldown = 20;
		this.t = 0;
		this.bulletLifeTime = 1000;

		this.level = level || 1;

		this.health = 20;
		this.id = planet.id;
		this.turretId = Function.randomString(5);
	}

	update(players, planet, io, projectiles) {
		if (this.health > 0) {
			// Update turret position
			let spawnVector = Vector.rotate(new Vector(planet.radius, 0), this.angle);
			this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);

			// Find closest player and aim at it
			let closestDistance = Infinity;
			let closestPlayer = undefined;
			for (let id in players) {
				var p = players[id];
				let dist = Function.dist(this.pos, p.pos);
				let playerAlive = !p.crashed && p.fuel > 0 && p.oxygen > 0 && p.integrity > 0;

				if (dist < closestDistance && playerAlive) {
					closestDistance = dist;
					closestPlayer = p;
				}
			}

			// Move the turret towards the player
			if (closestPlayer) {
				this.barrelHeading = new Vector(closestPlayer.pos.x, closestPlayer.pos.y);
				this.barrelHeading.sub(this.pos);
				this.barrelHeading.normalize();

				this.barrelAngle = Math.atan2(this.barrelHeading.y, this.barrelHeading.x)
			}

			// Shoot at the player
			if (closestPlayer && closestDistance < 1000 && Function.dist(new Vector(), closestPlayer.pos) > 250) {
				if (this.t <= 0) {
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

					var projectileData = {
						pos: bulletPos,
						vel: new Vector(),
						heading: this.barrelHeading,
						angle: this.barrelAngle,
						speed: 0.5,
						time: Date.now(),
						id: this.id,
						type: "turret"
					}

					io.emit('projectile', projectileData);
					projectiles.push(projectileData);

					if (this.level >= 2) {
						horizontalDisplacement.mult(-2);
						bulletPos.add(horizontalDisplacement);

						var projectileData = {
							pos: bulletPos,
							vel: new Vector(),
							heading: this.barrelHeading,
							angle: this.barrelAngle,
							speed: 0.5,
							time: Date.now(),
							id: this.id,
							type: "turret"
						}
						io.emit('projectile', projectileData);
						projectiles.push(projectileData);
					}
					
					this.t = this.cooldown;
				} else if (this.t > 0) {
					this.t -= 1;
				}
			}
		}
	}
}