class Planet {
	constructor(x, y, mass, radius, type, name, color, strokeColor, resource, id) {

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
		this.type = type;
		this.resource = resource;
		this.id = id;

		// Statistics
		this.oxygen = true;	
		this.color = color;
		this.maxColor = color;
		this.strokeColor = strokeColor || pSBC(-0.2, this.color, false, true);
		this.maxStrokeColor = this.strokeColor;
		this.danger = 0;
		this.turrets = [];
		this.bases = [];
	}

	display() {
		let zoom = display.zoom;

		this.escapeThrust = round((this.mass*rocket.mass)/Math.pow(this.radius+rocket.height/2, 2));

		if (inScreen(this.pos, false, this.radius + 100)) {
			
			ctx.save();

			let options = {
				outline: true,
				outlineWidth: 10-(0.5/display.zoom),
				outlineColor: this.strokeColor, 
				glow: true,
				glowColor: this.color
			}

			if(display.performanceMode) {
				options.glow = false;
				options.outline = false;
			}

			var screenPos = getScreenPos(this.pos, zoom);

			// Draw Planet
			if(this.type == "Planet") {
				drawCircle(screenPos.x, screenPos.y, this.radius*zoom, this.color, options);
			} else if(this.type == "Black Hole") {
				drawCircle(screenPos.x, screenPos.y, this.radius*zoom, this.color, options);

				let horizonDistance = getDistance(screenPos.x - rocket.pos.x*zoom + canvas.width/2,
				screenPos.y - rocket.pos.y*zoom + canvas.height/2, canvas.width/2, canvas.height/2);

				//Event horizon
				if (horizonDistance >= this.radius*1.5*zoom) {
					drawCircle(screenPos.x, screenPos.y, this.radius*1.5*zoom, this.color, options);
				} else {
					drawCircle(screenPos.x, screenPos.y, (canvas.width*4 - canvas.width*4*(horizonDistance/(200*zoom))), this.color, options);
				}
			}
			ctx.restore();
		}
	}

	displayTurret() {
		let zoom = display.zoom;
		// Draw turrets
		for (let t of this.turrets) {
			if (inScreen(t.pos, false, 100*zoom)) {
				var screenPos = getScreenPos(t.pos, zoom);
				
				var turretBarrel = new Vector(t.barrelHeading.x, t.barrelHeading.y);
				turretBarrel.mult(45*zoom);

				drawLine(screenPos.x, screenPos.y, screenPos.x+turretBarrel.x, screenPos.y+turretBarrel.y, "#1c1c1c", 10*zoom, "butt")

				drawRotatedRoundedRect(screenPos.x, screenPos.y, 35*zoom, 25*zoom, 4*zoom, "#404040", t.angle + Math.PI/2);
			}
		}
	}

	displayBase() {
		let zoom = display.zoom;
		// Draw turrets
		for (let b of this.bases) {
			if (inScreen(b.pos, false, 100*zoom)) {
				var screenPos = getScreenPos(b.pos, zoom);
				if(b.level == 1) {
					drawImage(base_level1, screenPos.x, screenPos.y, 40*zoom, 30*zoom, b.angle + Math.PI/2);
				} else if(b.level == 2) {
					drawImage(base_level2, screenPos.x, screenPos.y, 40*zoom, 38*zoom, b.angle + Math.PI/2);
				} else if(b.level == 3) {
					drawImage(base_level3, screenPos.x, screenPos.y, 40*zoom, 58*zoom, b.angle + Math.PI/2);
				}
			}
		}
	}

	drawMarker() {
		if(display.legacyPlanetMarker) {
			let markerRadius = 10;

			let zoom = display.zoom;
			let rocketPos = Vector.mult(rocket.pos, zoom);
			let pos = Vector.mult(this.pos, zoom);

			let distance = dist(this.pos, rocket.pos) - this.radius - rocket.height/2;
			if (distance < 5000 && !inScreen(this.pos)) {
				let xPos, yPos;

				let screenX, screenY;

				let xDiff, yDiff;

				let xRatio, yRatio;

				let textOffset = "center";
				let vOffset = "middle";
				let offX = 0;
				let offY = 0;

				if (rocketPos.y - pos.y > 0) {
					xDiff = (pos.x - rocketPos.x);
					yPos = markerRadius + 5;
					vOffset = "top";
					offY = 15;
				} else {
					xDiff = -(pos.x - rocketPos.x);
					yPos = canvas.height - (markerRadius + 5);
					vOffset = "bottom";
					offY = -15;
				}

				yRatio = (canvas.height/2 / (rocketPos.y - pos.y));
				screenX = canvas.width/2 + xDiff * yRatio;

				xPos = constrain(screenX, markerRadius + 5, canvas.width - markerRadius - 5);

				if (screenX > canvas.width || screenX < 0) {
					if (rocketPos.x - pos.x < 0) {
	    				yDiff = (pos.y - rocketPos.y);
	    				xPos = canvas.width - (markerRadius + 5);
	    				textOffset = "right";
	    				offX = -15;
	    				offY = 0;
	    				vOffset = "middle";
	    			} else {
	    				yDiff = -(pos.y - rocketPos.y);
	    				xPos = markerRadius + 5;
	    				textOffset = "left";
	    				offX = 15;
	    				offY = 0;
	    				vOffset = "middle";
	    			}

	    			xRatio = canvas.width/2 / (pos.x - rocketPos.x);
	    			screenY = canvas.height/2 + yDiff * xRatio;
	    			yPos = constrain(screenY, markerRadius + 5, canvas.height - markerRadius - 5);
				}
				let options = {
					outline: true, 
					outlineColor: this.strokeColor,
					outlineWidth: 3
				}
				drawCircle(xPos, yPos, markerRadius, this.color, options)
				if (distance < 8000)
					drawText(Math.round(distance) + "m", xPos + offX, yPos + offY, "20px Arial", "white", textOffset, vOffset);
			}
		} else {
			// Draw markers around the edges of the screen to indicate the distance of the plamet
			let markerRadius = 10;

			let zoom = display.zoom;
			let rocketPos = Vector.mult(rocket.pos, zoom);
			let pos = Vector.mult(this.pos, zoom);

			let distance = dist(this.pos, rocket.pos) - this.radius - rocket.height/2;
			if (!inScreen(this.pos) && distance < 5000) {
				let xPos, yPos;
				let screenX, screenY;
				let xDiff, yDiff;
				let xRatio, yRatio;

				let textOffset = "center";
				let vOffset = "middle";
				let offX = 0;
				let offY = 0;

				if (rocketPos.y - pos.y > 0) {
					xDiff = (pos.x - rocketPos.x);
					yPos = markerRadius;
					vOffset = "top";
					offY = 15;
				} else {
					xDiff = -(pos.x - rocketPos.x);
					yPos = canvas.height - (markerRadius);
					vOffset = "bottom";
					offY = -15;
				}

				yRatio = (canvas.height/2 / (rocketPos.y - pos.y));
				screenX = canvas.width/2 + xDiff * yRatio;

				xPos = constrain(screenX, markerRadius + 5, canvas.width - markerRadius - 5);

				if (screenX > canvas.width || screenX < 0) {
					if (rocketPos.x - pos.x < 0) {
	    				yDiff = (pos.y - rocketPos.y);
	    				xPos = canvas.width - (markerRadius);
	    				textOffset = "right";
	    				offX = -15;
	    				offY = 0;
	    				vOffset = "middle";
	    			} else {
	    				yDiff = -(pos.y - rocketPos.y);
	    				xPos = markerRadius;
	    				textOffset = "left";
	    				offX = 15;
	    				offY = 0;
	    				vOffset = "middle";
	    			}

	    			xRatio = canvas.width/2 / (pos.x - rocketPos.x);
	    			screenY = canvas.height/2 + yDiff * xRatio;
	    			yPos = constrain(screenY, markerRadius + 5, canvas.height - markerRadius - 5);
				}
				let options = {
					outline: true, 
					outlineColor: this.strokeColor,
					outlineWidth: 3
				}	

				let distanceValue = Math.abs(distance / 5000);

				//drawCircle(xPos, yPos, markerRadius, this.color, options)
				if (screenX > canvas.width || screenX < 0) { 
					drawLine(xPos, yPos-markerRadius - (this.radius*0.5 - this.radius*0.5*distanceValue), xPos, yPos+markerRadius + (this.radius*0.5 - this.radius*0.5*distanceValue), this.color, markerRadius, "round", 1-(distance/5000));		
				} else {
					drawLine(xPos-markerRadius - (this.radius*0.5 - this.radius*0.5*distanceValue), yPos, xPos+markerRadius + (this.radius*0.5 - this.radius*0.5*distanceValue), yPos, this.color, markerRadius, "round", 1-(distance/5000));		
				}
				if (distance < 2000) {
					//drawText(Math.round(distance) + "km", xPos + offX, yPos + offY, "20px Arial", "white", textOffset, vOffset, 1);
				} else {
					//drawText(round(distance/1000, 1) + "km", xPos + offX, yPos + offY, "20px Arial", "white", textOffset, vOffset, 1);
				}
			}
		}
	}
}