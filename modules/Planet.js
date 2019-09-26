var Vector = require('./Vector.js');
var Resource = require('./Resource.js');

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
		if(name == "Earth") {
			this.resource = new Resource("None");
		} else if(name == "Black Hole"){
			this.resource = new Resource("Singularium", this.radius*2);
		} else if(name == "Kanus Maximus"){
			this.resource = new Resource("Kanium", this.radius*2);
		} else {
			this.resource = new Resource(undefined, this.radius*2);
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
	}
}