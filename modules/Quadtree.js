var Function = require('./Function.js');
var Vector = require('./Vector.js');
var Particle = require('./Particle.js');
var Rectangle = require('./Rectangle.js');
var Circle = require('./Circle.js');

module.exports = class QuadTree {
	constructor(boundary, capacity) {
		this.boundary = boundary; // Rectangle space to confine the quadtree
		this.capacity = capacity; // Maximum capacity of points before a subdivide of quadtree
		this.points = []; // Array to store the points in the quad tree

		this.divided = false;
	}

	subdivide() {
		var x = this.boundary.x; // Northeast
		var y = this.boundary.y; // Northwest
		var w = this.boundary.w; // Southeast
		var h = this.boundary.h; // Southwest

		// Create 4 subsections of the quadtree
		this.ne = new QuadTree(new Rectangle(x + w/2, y - h/2, w/2, h/2), this.capacity);
		this.nw = new QuadTree(new Rectangle(x - w/2, y - h/2, w/2, h/2), this.capacity);
		this.se = new QuadTree(new Rectangle(x + w/2, y + h/2, w/2, h/2), this.capacity);
		this.sw = new QuadTree(new Rectangle(x - w/2, y + h/2, w/2, h/2), this.capacity);

		this.divided = true;
	}

	insert(point) {
		if (!this.boundary.contains(point)) {
			return false;
		}

		if (this.points.length < this.capacity) {
			this.points.push(point);
			return true;
		} else {
			if (!this.divided) {
				this.subdivide();
			}

			if (this.ne.insert(point)) {
				return true;
			} else if (this.nw.insert(point)) {
				return true;
			} else if (this.se.insert(point)) {
				return true;
			} else if (this.sw.insert(point)) {
				return true;
			}
		}
	}

	query(range, found) {
		if (!found) {
			found = [];
		}
		if (!range.intersects(this.boundary)) {
			return found; // Found nothing
		}

		for (let p of this.points) {
			if (range.contains(p)) {
				found.push(p)
			}
		}

		if (this.divided) {
			this.ne.query(range, found);
			this.nw.query(range, found);
			this.se.query(range, found);
			this.sw.query(range, found);
		}
		return found;
	}
}