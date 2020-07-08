var Vector = require('../util/Vector.js');
var Function = require('../util/Util.js');

module.exports = class Structure {
	constructor(planet, angle, level, id) {

		// Position
		let spawnVector = Vector.rotate(new Vector(planet.radius, 0), angle);
		this.planetPos = planet.pos;
		this.pos = new Vector(planet.pos.x+spawnVector.x, planet.pos.y+spawnVector.y);
		this.heading = spawnVector.normalize();
		this.angle = angle;

		// Size
		this.radius = 70;

		// Barrel
		this.barrelAngle = 0;
		this.barrelHeading = new Vector(1, 0);
		this.viewRadius = 1000; // How far the turret can see
		this.barrelShot = 0;
		this.level = level || 1;

		// Health
		this.health = 20;
		this.id = planet.id;
		this.turretId = id;

		this.range = 1000;
		this.type = Function.randInt(0, 1) == 0 ? "laser" : "seeking"; 

		this.shootDelay = this.type == "laser" ? 500 : 1000;
		this.shootTime = 0;
		this.bulletLifeTime = 1000;
	}
}