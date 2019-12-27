class Base {
	constructor(associatedPlanet, angle, level) {
		this.planet = associatedPlanet;
		this.angle = angle;

		let spawnVector = Vector.rotate(new Vector(0, this.planet.radius), this.angle);
		this.pos = new Vector(this.planet.lpos.x+spawnVector.x, this.planet.pos.y+spawnVector.y);

		this.level = level || 1;
	}
}