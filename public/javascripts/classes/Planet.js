class Planet {
	constructor(x, y, mass, radius, type, name, color, strokeColor, resource) {
		this.pos = new Vector(x, y);

		this.mass = mass;
		this.maxMass = this.mass;

		this.radius = radius;
		this.maxRadius = this.radius;

		this.name = name;
		this.type = type;
		this.resource = resource;
		this.oxygen = true;	
		this.color = color;
		this.maxColor = color;
		this.strokeColor = strokeColor || pSBC(-0.2, this.color, false, true);
		this.maxStrokeColor = this.strokeColor;
	}

	display() {
		this.escapeThrust = round((this.mass*rocket.mass)/Math.pow(this.radius+rocket.height/2, 2));

		if (inScreen(this.pos, false, this.radius + 100)) {
			let zoom = display.zoom;
			ctx.save();

			let options = {
				outline: true,
				outlineWidth: 10,
				outlineColor: this.strokeColor, 
				glow: true,
				glowColor: this.color
			}

			var screenPos = getScreenPos(this.pos, zoom);

			//Draw Planet
			if(this.type == "Planet") {
				drawCircle(screenPos.x, screenPos.y, this.radius*zoom, this.color, options);
			} else if(this.type == "Black Hole") {
				drawCircle(screenPos.x, screenPos.y, this.radius*zoom, this.color, options);

				let horizonDistance = getDistance(screenPos.x - rocket.pos.x*zoom + canvas.width/2,
				screenPos.y - rocket.pos.y*zoom + canvas.height/2, canvas.width/2, canvas.height/2);

				//Event horizon
				if(horizonDistance >= this.radius*1.5*zoom) {
					drawCircle(screenPos.x, screenPos.y, this.radius*1.5*zoom, this.color, options);
				} else {
					drawCircle(screenPos.x, screenPos.y, (canvas.width*4 - canvas.width*4*(horizonDistance/(200*zoom))), this.color, options);
				}
			}
			ctx.restore();
		}
	}

	drawMarker() {
		/*let markerRadius = 10;

		let zoom = display.zoom;
		let rocketPos = Vector.mult(rocket.pos, zoom);
		let pos = Vector.mult(this.pos, zoom);

		let distance = dist(this.pos, rocket.pos) - this.radius - rocket.height/2;
		if (inScreen(this.pos)) {
			drawText(Math.round(distance) + "km", pos.x - rocketPos.x + canvas.width/2, pos.y - rocketPos.y + canvas.height/2, "40px Arial", "white", "center", "middle");
		} else {
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
				drawText(Math.round(distance) + "km", xPos + offX, yPos + offY, "20px Arial", "white", textOffset, vOffset);
		}*/
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
				drawLine(xPos, yPos-markerRadius - (this.radius*0.5 - this.radius*0.5*distanceValue), xPos, yPos+markerRadius + (this.radius*0.5 - this.radius*0.5*distanceValue), this.color, markerRadius, "round", 0.8);		
			} else {
				drawLine(xPos-markerRadius - (this.radius*0.5 - this.radius*0.5*distanceValue), yPos, xPos+markerRadius + (this.radius*0.5 - this.radius*0.5*distanceValue), yPos, this.color, markerRadius, "round", 0.8);		
			}
			if (distance < 2000) {
				//drawText(Math.round(distance) + "km", xPos + offX, yPos + offY, "20px Arial", "white", textOffset, vOffset, 1);
			} else {
				//drawText(round(distance/1000, 1) + "km", xPos + offX, yPos + offY, "20px Arial", "white", textOffset, vOffset, 1);
			}
		}
	}
}