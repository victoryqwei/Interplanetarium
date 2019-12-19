var Vector = require('./Vector.js');
var Function = require('./Function.js');

module.exports = class Turret {
	constructor(planet, angle) {
		let spawnVector = Vector.rotate(new Vector(planet.radius, 0), angle);
		this.planetPos = planet.pos;
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);
		this.heading = spawnVector.normalize();
		this.angle = angle;

		this.barrelAngle = 0;
		this.barrelHeading = new Vector(1, 0);

		this.projectiles = [];

		this.cooldown = 200;
		this.t = 0;
	}

	update(players, planet) {
		// Update turret position
		let spawnVector = Vector.rotate(new Vector(planet.radius, 0), this.angle);
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);

		// Find closest player and aim at it
		let closestDistance = Infinity;
		let closestPlayer = undefined;
		for (let id in players) {
			var p = players[id];
			let dist = Function.dist(this.pos, p.pos);

			if (dist < closestDistance) {
				closestDistance = dist;
				closestPlayer = p;
			}
		}

		if (closestPlayer) {
			this.barrelHeading = new Vector(closestPlayer.pos.x, closestPlayer.pos.y);
			this.barrelHeading.sub(this.pos);
			this.barrelHeading.normalize();

			this.barrelAngle = Math.atan2(this.barrelHeading.y, this.barrelHeading.x)
		}
	}
}