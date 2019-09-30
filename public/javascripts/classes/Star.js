class Star {
	constructor (x, y, exact, starDistance) {
		this.pos = new Vector(randInt(-x, x), randInt(-y, y));
		if (exact)
			this.pos = new Vector(x, y);
		this.starDistance = starDistance || 20;
	}

	display() {
		let starDistance = this.starDistance;
		let zoom = display.zoom;

		if (inScreen(this.pos, starDistance)) {

			var distance = Infinity;
			var planetIndex = 0;

			// Find closest planet to star
			for (let id in planets) {
				let p = planets[id];
				if(p.type == "Black Hole") {	
					if(getDistance(p.pos.x*zoom - rocket.pos.x*zoom + canvas.width/2,
					p.pos.y*zoom - rocket.pos.y*zoom + canvas.height/2,
					this.pos.x*zoom - rocket.pos.x*zoom / starDistance + canvas.width/2, 
					this.pos.y*zoom - rocket.pos.y*zoom / starDistance + canvas.height/2) < distance) {
						distance = getDistance(p.pos.x*zoom - rocket.pos.x*zoom + canvas.width/2,
						p.pos.y*zoom - rocket.pos.y*zoom + canvas.height/2,
						this.pos.x*zoom - rocket.pos.x*zoom / starDistance + canvas.width/2, 
						this.pos.y*zoom - rocket.pos.y*zoom / starDistance + canvas.height/2);
					planetIndex = id;
					}
				}
			}

			// Star is close to black hole
			if(distance < 300*zoom) {
				
				let starRadian = Math.atan2((this.pos.y*zoom - rocket.pos.y*zoom / starDistance + canvas.height/2) - (planets[planetIndex].pos.y*zoom - rocket.pos.y*zoom + canvas.height/2), 
					(this.pos.x*zoom - rocket.pos.x*zoom / starDistance + canvas.width/2) - (planets[planetIndex].pos.x*zoom - rocket.pos.x*zoom + canvas.width/2));

				// Why the fuck is this not from helper
				ctx.save();
				ctx.beginPath();
				ctx.lineCap = "round";
				ctx.shadowColor = "white";
				ctx.shadowBlur = 75 - 75*(distance/(300*zoom));
				ctx.globalAlpha = 1;
				ctx.lineWidth = 3;
				ctx.arc(planets[planetIndex].pos.x*zoom - rocket.pos.x*zoom + canvas.width/2,
				planets[planetIndex].pos.y*zoom - rocket.pos.y*zoom + canvas.height/2, 
				distance, starRadian - (Math.PI - Math.PI*(distance/(300*zoom))), starRadian + (Math.PI - Math.PI*(distance/(300*zoom))))
				ctx.stroke();
				ctx.lineCap = "butt";
				ctx.closePath();
				ctx.restore();

			} else {
				ctx.save();
				ctx.beginPath();
				drawCircle(
					this.pos.x*zoom - rocket.pos.x*zoom / starDistance + canvas.width/2, 
					this.pos.y*zoom - rocket.pos.y*zoom / starDistance + canvas.height/2, 
					2, 
					"white"
				);
				ctx.closePath();
				ctx.restore();
			}
		}
	}
}