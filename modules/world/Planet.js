/*

Creates a planet to be added to the map

*/

var Vector = require('../util/Vector.js');
var Function = require('../util/Util.js');
var Resource = require('./Resource.js');
var Turret = require('./Turret.js')
var Base = require('./Base.js')

module.exports = class Planet {
	constructor(x, y, mass, radius, type, name = "Planet", color = "#c1440e", strokeColor) {
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
		this.id = Function.randomString(5);
		this.type = "planet"

		//Resources
		
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

		// Resource
		this.oxygen = true;	

		// Color
		this.color = color;
		this.maxColor = color;
		//this.strokeColor = strokeColor || pSBC(-0.2, this.color, false, true);
		this.strokeColor = strokeColor || undefined;
		this.maxStrokeColor = this.strokeColor;

		// Structures
		this.turrets = {};
		this.bases = {};

		// Planet danger system
		this.danger = ((Math.random()) + (this.richness))/2;

		// Minimum danger
		let minimumBaseDanger = 0.5;
		let minimumTurretDanger = 0.2;

		// Set turret and base levels
		let turretCount = Math.floor(Math.max((this.danger-minimumTurretDanger)*20, 0));
		let turretLevel = Function.randInt(1, 2);

		let baseCount = Math.floor(this.danger/minimumBaseDanger);
		let baseLevel = Math.round(this.danger*2.2);

		// Extreme base 
		if (Math.random() > 0.98) {
		    this.danger = 1;
		    turretCount = 20;
		    baseCount = 1;
		    baseLevel = 3;
		}
		
		// Spawn turrets and bases
		if (this.name != "Black Hole" && this.name != "Earth") {
			for (let i = 0; i < turretCount; i++) {
				let randAngle = Function.random(0, 2*Math.PI);
				let spawnVector = Vector.rotate(new Vector(this.radius, 0), randAngle);
				let pos = new Vector(this.pos.x+spawnVector.x, this.pos.y+spawnVector.y);

				let collision = false;
				for (let id in this.turrets) {
					let t = this.turrets[id];
					if (Function.dist(pos, t.pos) < 100) {
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
					this.turrets[id] = new Turret(this, randAngle, turretLevel, id);
				}
			}
			for (let i = 0; i < baseCount; i++) {
				let randAngle = Function.random(0, 2*Math.PI);
				let spawnVector = Vector.rotate(new Vector(this.radius, 0), randAngle);
				let pos = new Vector(this.pos.x+spawnVector.x, this.pos.y+spawnVector.y);

				let collision = false;
				for (let id in this.turrets) {
					let t = this.turrets[id];
					if (Function.dist(pos, t.pos) < 100) {
						collision = true;
					}
				}

				for (let id in this.bases) {
					let t = this.bases[id];
					if (Function.dist(pos, t.pos) < 100) {
						collision = true;
					}
				}

				if (!collision) {
					let id = Function.randomString(5);
					this.bases[id] = new Base(this, randAngle, baseLevel, id);
				}
				
			}
		}
	}
}