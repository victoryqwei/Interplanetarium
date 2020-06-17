/*

Creates a planet to be added to the map

*/

var Vector = require('../util/Vector.js');
var Function = require('../util/Util.js');
var Resource = require('./Resource.js');
var Turret = require('./Turret.js')
var Base = require('./Base.js')
var {QuadTree, Rectangle, Point} = require('../util/QuadTree.js');

module.exports = class Planet {
	constructor(x, y, mass, radius, type, name = "Planet", color = "#c1440e", strokeColor, id) {
		// Position
		this.pos = new Vector(x, y);

		// Mass
		this.mass = mass;
		this.maxMass = this.mass;

		// Radius
		this.radius = radius;
		this.maxRadius = this.radius;

		// Name
		this.name = name;

		// Id
		this.id = id;
		this.type = "planet"

		// Resources
		this.richness = Math.random();

		if(name == "Earth") {
			this.resource = new Resource("None");
		} else if(name == "Black Hole"){
			this.resource = new Resource("Singularium", 1000 * ((this.radius/300) + (this.richness))/2);
		} else if(name == "Kanus Minimus"){
			this.resource = new Resource("Kanium", 1000 * ((this.radius/300) + (this.richness))/2);
		} else {
			this.resource = new Resource(undefined, 1000 * ((this.radius/300) + (this.richness))/2);
		}

		// Type
		this.type = type;

		// Color
		this.color = color;
		this.strokeColor = strokeColor || undefined;

		// Structures
		this.turrets = {};

		// Set turret and base levels
		let turretCount = 10;
		let turretLevel = Function.randInt(1, 2);
		
		// Spawn turrets and bases
		if (this.name != "Black Hole" && this.name != "Earth") {
			for (let i = 0; i < turretCount; i++) {
				let randAngle = Function.random(0, 2*Math.PI);
				let spawnVector = Vector.rotate(new Vector(this.radius, 0), randAngle);
				let pos = new Vector(this.pos.x+spawnVector.x, this.pos.y+spawnVector.y);

				let collision = false;
				for (let id in this.turrets) {
					let t = this.turrets[id];
					if (Function.dist(pos, t.pos) < 40) {
						collision = true;
					}
				}

				for (let id in this.bases) {
					if (Function.dist(pos, t.pos) < 100) {
						collision = true;
					}
				}

				if (!collision) {
					let id = Function.randomString(5);
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