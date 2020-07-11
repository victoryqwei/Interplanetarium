/*

Creates a planet to be added to the map

*/

var Vector = require('../util/Vector.js');
var Function = require('../util/Util.js');
var Turret = require('./Turret.js')
var Base = require('./Base.js')
var {QuadTree, Rectangle, Point} = require('../util/QuadTree.js');

module.exports = class Planet {
	constructor(x, y, mass, radius, type, name = "Planet", color = "#c1440e", id, stage) {
		// Position
		this.pos = new Vector(x, y);

		// Name
		this.name = name;

		// Mass
		this.mass = mass;
		this.radius = radius;

		// Id
		this.id = id;
		this.type = type || "planet";

		// Color
		this.color = color;

		// Structures
		this.turrets = {};
		this.bases = {};

		// Set turret and base levels
		let turretCount = Function.randInt(6, Math.min(Math.ceil(stage*5) + 6, 30));
		let baseCount = Function.randInt(0, Math.min(Math.ceil(stage/2), 3));
		
		
		// Spawn turrets and bases
		if (this.type != "blackhole") {
			for (let i = 0; i < baseCount; i++) {
				let randAngle = Function.random(0, 2*Math.PI);
				let spawnVector = Vector.rotate(new Vector(this.radius, 0), randAngle);
				let pos = new Vector(this.pos.x+spawnVector.x, this.pos.y+spawnVector.y);
				var collision = false;
				for (let id in this.bases) {
					let b = this.bases[id];
					if (Function.dist(pos, b.pos) < 100) {
						collision = true;
					}
				}

				if (!collision) {
					let id = Function.randomString(5);
					let baseLevel = Function.randInt(1, Math.min(Math.ceil(stage/2), 3));
					let base = new Base(this, randAngle, baseLevel, id)
					this.bases[id] = base;
				}
			}

			for (let i = 0; i < turretCount; i++) {
				let randAngle = Function.random(0, 2*Math.PI);
				let spawnVector = Vector.rotate(new Vector(this.radius, 0), randAngle);
				let pos = new Vector(this.pos.x+spawnVector.x, this.pos.y+spawnVector.y);

				var collision = false;
				for (let id in this.turrets) {
					let t = this.turrets[id];
					if (Function.dist(pos, t.pos) < 40) {
						collision = true;
					}
				}
				for (let id in this.bases) {
					let b = this.bases[id];
					if (Function.dist(pos, b.pos) < 100) {
						collision = true;
					}
				}

				if (!collision) {
					let id = Function.randomString(5);
					let turretLevel = Function.randInt(1, Math.min(Math.ceil(stage/2), 3));
					let turret = new Turret(this, randAngle, turretLevel, id)
					this.turrets[id] = turret;
				}
			}	
		}
	}

	update(players, projectiles) {
		for (let id in this.turrets) {
			this.turrets[id].update(this, players, projectiles);
		}
	}
}