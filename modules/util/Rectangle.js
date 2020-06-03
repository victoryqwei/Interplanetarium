module.exports = class Rectangle {
	constructor(x, y, w, h) {
		this.x = x; // Position of the quadtree (centre of the rectangle)
		this.y = y;
		this.w = w; // Width
		this.h = h; // Height
	}

	contains(point) {
		return (
			point.x >= this.x - this.w && 
			point.x <= this.x + this.w && 
			point.y >= this.y - this.h &&
			point.y <= this.y + this.h
		)
	}

	intersects(range) {
		return !(range.x - range.w > this.x + this.w || 
			range.x + range.w < this.x - this.w || 
			range.y - range.h > this.y + this.h || 
			range.y + range.h < this.y - this.h)
	}
}