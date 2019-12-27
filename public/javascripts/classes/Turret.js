class Turret {
	constructor(associatedPlanet, angle) {
		this.planet = associatedPlanet;
		this.angle = angle;

		let spawnVector = Vector.rotate(new Vector(0, this.planet.radius), this.angle);
		this.pos = new Vector(this.planet.lpos.x+spawnVector.x, this.planet.pos.y+spawnVector.y);


	}

	update() {

	}

	display() {
		if (inScreen(this.pos, false, 10)) {
			let zoom = display.zoom;
			ctx.save();

			var screenPos = getScreenPos(this.pos, zoom);

			drawCircle(screenPos.x, screenPos.y, this.radius*zoom);

			ctx.restore();
		}
	}
}