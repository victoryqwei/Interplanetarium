var Vector = require('../util/Vector.js');
var Function = require('../util/Util.js');

module.exports = class Base {
	constructor(planet, angle, level, id) {
		let spawnVector = Vector.rotate(new Vector(planet.radius+10*level, 0), angle);
		this.planetPos = planet.pos;
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);
		this.heading = spawnVector.normalize();
		this.angle = angle;

		this.radius = 100;

		this.health = 20;
		this.id = planet.id;
		this.baseId = id;

		this.level = level;
	}

	update(players, planet) {
		// Update turret position
		let spawnVector = Vector.rotate(new Vector(planet.radius, 0), this.angle);
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);
	}
}