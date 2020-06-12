export class Point {
	constructor(x, y, r, data) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.data = data;
	}
}

export class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.r = 4;
		this.highlight = false;
	}

	intersects(other) {
		var d = dist(this, other)
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

export class Rectangle {
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

export class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = this.r * this.r;
  }

  contains(point) {
    // check if the point is in the circle by checking if the euclidean distance of
    // the point and the center of the circle if smaller or equal to the radius of
    // the circle
    let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
    return d <= this.rSquared;

    return false;
  }

  intersects(range) {

    let xDist = Math.abs(range.x - this.x);
    let yDist = Math.abs(range.y - this.y);

    // radius of the circle
    let r = this.r;

    let w = range.w;
    let h = range.h;

    let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

    // no intersection
    if (xDist > (r + w) || yDist > (r + h))
      return false;

    // intersection within the circle
    if (xDist <= w || yDist <= h)
      return true;

    // intersection on the edge of the circle
    return edges <= this.rSquared;

    return false;
  }
}

export class QuadTree {
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
			let exists = false;
			for (let p of this.points) {
				if (p.data.id && p.data.id == point.data.id) {
					exists = true;
					p.data = point.data;
				}
			}
			if (!exists)
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

	show(color) {
		ctx.strokeStyle = color || "white"
		ctx.lineWidth = 5*display.zoom;
		var screenPos = getScreenPos(new Vector(this.boundary.x-this.boundary.w, this.boundary.y-this.boundary.h), display.zoom)
		ctx.strokeRect(screenPos.x, screenPos.y, this.boundary.w*2*display.zoom, this.boundary.h*2*display.zoom);
		if (this.divided) {
			this.ne.show();
			this.nw.show();
			this.se.show();
			this.sw.show();
		}

		for (let p of this.points) {
			var screenPos = getScreenPos(new Vector(p.x, p.y), display.zoom);
			if (inScreen(p, 1, 5)) {
				drawCircle(screenPos.x, screenPos.y, 5*display.zoom, color || "white");
			}
		}
	}
}