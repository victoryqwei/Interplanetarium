var Vector = require('./Vector.js');
var Resource = require('./Resource.js');
var Function = require('./Function.js');
var Turret = require('./Turret.js')

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

		//Resources
		
		this.richness = Math.random();

		if(name == "Earth") {
			this.resource = new Resource("None");
		} else if(name == "Black Hole"){
			this.resource = new Resource("Singularium", 1000 * ((this.radius/300) + (this.richness))/2);
		} else if(name == "Kanus Maximus"){
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

		let danger = (Function.randomG(5) - 0.25);
		if(danger < 0) {
			danger = 0.5 + (-danger);
		}

		this.danger = danger;

		// Danger
		this.danger = ((Math.random()) + (this.richness))/2;
	
		// Turrets

		this.turrets = [];

		let turretCount = /*Math.floor(Math.max((this.danger-0.4)*20, 0))*/5;
		if(this.danger == 1) {
			let turretCount = 20;
		}
		if (this.name != "Black Hole") {
			for (let i = 0; i < turretCount; i++) {
				this.turrets.push(new Turret(this, Function.random(0, 2*Math.PI)))
			}
		}
	}
}