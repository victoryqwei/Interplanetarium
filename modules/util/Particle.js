var Function = require('../util/Util.js');

module.exports = class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.r = 4;
		this.highlight = false;
	}

	intersects(other) {
		var d = Function.dist(this, other)
		return (d < this.r+other.r);
	}

	move() {
		this.x += Math.random()-0.5;
		this.y += Math.random()-0.5;
	}

	draw() {
		let color = "grey";
		if (this.highlight) {color = "white"};
		drawCircle(this.x, this.y, this.r, color);
	}
}