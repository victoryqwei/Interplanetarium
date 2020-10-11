import Style from "../visuals/Style.js";
import {util} from "../util/Util.js";
import {game} from "../game/Game.js";
import {camera} from "../visuals/Camera.js";
import {images} from "../world/assets.js";
import Vector from "../util/Vector.js";
import {QuadTree, Rectangle, Circle, Point} from "../util/QuadTree.js"

// Instantiate the canvas
window.canvas = document.getElementById("game-canvas");
window.ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
$(window).resize(function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
})

class Draw {

	constructor() {
		this.style = new Style(ctx);
	}

	drawRocket(player, serverRocket, showParticles, name, detail) {

		let {style} = this;

		if (!player) {
			return;
		}

		if (!player.alive) {
			return;
		}

		// Draw the player
		let rocket = game.rocket;
		let zoom = camera.warp ? camera.mapZ : camera.zoom;
		let width = (player.width || rocket.width) * zoom;
		let height = (player.height || rocket.height) * zoom;
		let pos = util.getScreenPos(player.pos, zoom, camera.pos);

		if (serverRocket) {
			this.addParticles(player);
			pos = util.getScreenPos(player.pos, zoom, camera.pos);
		}

		// Draw particle
		if (showParticles) {
			this.drawParticles(player, serverRocket);
		}

		// Check if rocket is in the screen
		if(detail) {
			if (!util.inScreen(player.pos, 1, 20, camera.pos))
				return;
		}

		// Draw body
        style.drawRect(pos.x, pos.y, width, height, player.angle, "#d3d3d3");
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(player.angle);

        // Set your mom
        let halfWidth = width/2;
        let halfHeight = height/2;

        // Draw thruster flame
        if (player.thrust > 0) {
        	let thrustLength = util.scale(player.thrust/rocket.maxThrust, 0, 1, 0.2, 1.5);
	       	style.drawTriangle(halfWidth, width*2 + (width*thrustLength / 2), width/3, width*thrustLength, Math.PI, "orange");
	        style.drawTriangle(-halfWidth, width*2 + (width*thrustLength / 2), width/3, width*thrustLength, Math.PI, "orange");
        }
        // Draw thrusters
        style.drawRect(-halfWidth, halfHeight, halfWidth, width, 0, player.color || "red");
        style.drawRect(halfWidth, halfHeight, halfWidth, width, 0, player.color || "red");
        // Draw nose cone
        style.drawTriangle(0, -halfHeight - halfWidth, width, width, 0, player.color || "red");
        if (detail) {
	        // Draw player window
	        style.drawRoundedRect(0-width/4, -width, halfWidth, width, 3*zoom, "rgb(70, 70, 70)")
	        // Draw thruster caps
	        style.drawTriangle(halfWidth, width/1.33, halfWidth, halfWidth, 0, player.color || "red");
	        style.drawTriangle(-halfWidth, width/1.33, halfWidth, halfWidth, 0, player.color || "red");
	        // Draw body accent
	        style.drawTriangle(0, height/4, width/1.5, -width/1.5, 0, "#bdbdbd");
	    }

        ctx.restore();
        
        if (serverRocket && !camera.warp)
        	style.drawText(name, pos.x, pos.y - height*1.2, 20+ "px Arial", "white", "center", "middle", 1);
    
	}

	addParticles(player) {

		let {style} = this;

		if (player.thrust <= 0)
			return;

		let rocket = game.rocket;

		let maxParticles = 1; // Change particles based on the FPS
		let thrustRatio = player.thrust/rocket.maxThrust;

		var rocketHeading = Vector.rotate(new Vector(0, -1), player.angle);
		rocketHeading.mult(-rocket.height/2-rocket.width/2);

		// Get thruster position
		var thrusterPos = new Vector(player.pos.x, player.pos.y);
		thrusterPos.add(rocketHeading);

		// Get previous thrust position (to be interpolated)
		var thrusterPos2;
		if (player.prevPos)
			thrusterPos2 = new Vector(player.prevPos.x, player.prevPos.y);
		else
			thrusterPos2 = new Vector(player.pos.x, player.pos.y);
		thrusterPos2.add(rocketHeading);
		
		// Add particles
		for (var i = 0; i < thrustRatio*maxParticles; i++) {
			let randomPoint = util.interpolate(thrusterPos, thrusterPos2, Math.random());
			// Add smoke particles
			let smokeOffset = (rocket.width)/2;

			let smokeParticle = new Vector(
				randomPoint.x+util.random(-smokeOffset, smokeOffset),
				randomPoint.y+util.random(-smokeOffset, smokeOffset)
			);

			smokeParticle.time = Date.now();
			smokeParticle.type = "smoke";
			player.particles.push(smokeParticle);
		}
	}

	drawParticles(player, serverRocket) {

		let {style} = this;
		
		let zoom = camera.warp ? camera.mapZ : camera.zoom;
		let rocket = game.rocket;
		let smoke = images.smoke;
		let smokeDuration = 500;

		if (!smoke || !player.particles)
			return;

		let pos = util.getScreenPos(player.pos, zoom, camera.pos);

		for (let i = 0; i < player.particles.length; i++) {
			let p = player.particles[i];
        	if (p.type == "smoke" && util.inScreen(p, 1, 20, camera.pos)) {
        		let size = rocket.width * util.random(1, 1.5);
				let particle = util.getScreenPos(p, zoom, camera.pos);
	        	ctx.globalAlpha = util.constrain(1-(Date.now()-p.time)/smokeDuration, 0, 1);
	            ctx.drawImage(smoke,
					particle.x-size*zoom/2,
					particle.y-size*zoom/2,
	            	size*zoom,
	            	size*zoom
	            );
        	}

            ctx.globalAlpha = 1;
		}

		// Remove old particles
		for (let i = player.particles.length-1; i > 0; i--) {
			if (player.particles[i].type == "smoke" && Date.now()-player.particles[i].time > smokeDuration) {
	        	player.particles.splice(i, 1);
	        }
		}
	}

	drawPlanet(pos, radius, type, config) {

		let {style} = this;

		let zoom = camera.warp ? camera.mapZ : camera.zoom;
		ctx.save();

		let options = {
			outline: true,
			outlineWidth: 10*zoom,
			outlineColor: util.shadeColor(config.color, -20),
			glow: true,
			glowColor: config.color,
			glowWidth: 100*zoom*util.constrain(game.sound.beatOpacity + 0.4, 0, 1),
			shadowAlpha: game.sound.beatOpacity
		}

		if (camera.warp && !util.inScreen(pos, false, radius, camera.pos)) {
			options.glow = false;
			options.outline = false;
		}

		var screenPos = util.getScreenPos(pos, zoom, camera.pos);

		// Draw Planet
		if (type == "planet") {
			style.drawCircle(screenPos.x, screenPos.y, (radius - 5)*zoom, config.color, options);
		} else if (type == "blackhole") {
			style.drawCircle(screenPos.x, screenPos.y, radius*zoom, config.color, options);
		}
		ctx.restore();

		style.drawText(config.name, screenPos.x, screenPos.y, radius/4*zoom + "px Arial", "white", "center", "middle", 1);
	}

	drawTurret(planet) {

		let {style} = this;

		let zoom = camera.warp ? camera.mapZ : camera.zoom;
		// Draw turrets
		for (let id in planet.turrets) {
			let t = planet.turrets[id];
			if (util.inScreen(t.pos, false, 100*zoom, camera.pos)) {
				var screenPos = util.getScreenPos(t.pos, zoom, camera.pos);
				
				var turretBarrel = new Vector(t.barrelHeading.x, t.barrelHeading.y);
				turretBarrel.mult((30 + (10 * (Math.min(t.barrelShot, 20) / 20))) * zoom);
				let screenBarrel = Vector.add(screenPos.copy(), turretBarrel.copy());
				let color = "#4a4a4a";

				// Draw turret
				style.drawLine(screenPos.x, screenPos.y, screenPos.x+turretBarrel.x, screenPos.y+turretBarrel.y, color, 10*zoom, "butt")
				style.drawRotatedRoundedRect(screenPos.x, screenPos.y, 35*zoom, 25*zoom, 4*zoom, util.shadeColor("#a3a3a3", 100* Math.max(-(1-t.health/20),-1)), t.angle + Math.PI/2);
			}
		}
	}

	drawBase(planet) {

		let {style} = this;

		let zoom = camera.warp ? camera.mapZ : camera.zoom;
		// Draw turrets
		for (let id in planet.bases) {
			let b = planet.bases[id];
			if (util.inScreen(b.pos, false, 100*zoom, camera.pos)) {
				var screenPos = util.getScreenPos(b.pos, zoom, camera.pos);

				if(b.level == 1)
					style.drawImage(images.baseLevel1, screenPos.x, screenPos.y, 40*zoom, 30*zoom, b.angle + Math.PI/2)
				if(b.level == 2)
					style.drawImage(images.baseLevel2, screenPos.x, screenPos.y, 40*zoom, 40*zoom, b.angle + Math.PI/2)
				if(b.level == 3)
					style.drawImage(images.baseLevel3, screenPos.x, screenPos.y, 40*zoom, 60*zoom, b.angle + Math.PI/2)
			}
		}
	}

	drawWarp(starQ) {

		let {style} = this;
		
		if (!game.map || game.state != "play" || camera.warp)
			return;

		let zoom = camera.warp ? camera.mapZ : camera.zoom;
		let arcDistance = 150;

		for (let id in game.screen.planets) {
			let p = game.screen.planets[id];
			if (p.type == "blackhole") {
				// Screen position of planet
				let planetScreen = util.getScreenPos(p.pos, zoom, game.rocket.pos);

				let range = new Circle(planetScreen.x, planetScreen.y, arcDistance*zoom);
				let points = starQ.query(range);

				for (let point of points) {
					let starRadian = Math.atan2(point.y - planetScreen.y, point.x - planetScreen.x);
					let distance = util.getDistance(planetScreen.x, planetScreen.y, point.x, point.y);
					let starArc = Math.PI - Math.PI*(distance/(arcDistance*zoom));

					ctx.beginPath();
					ctx.strokeStyle = "white";
					ctx.lineCap = "round";
					ctx.globalAlpha = 1;
					ctx.lineWidth = point.data.t;
					ctx.arc(planetScreen.x, planetScreen.y, distance, starRadian - starArc, starRadian + starArc);
					ctx.stroke();
					ctx.lineCap = "butt";
					ctx.closePath();
				}
			}
		}
	}

	drawStar(px, py, sx, sy, t) {

		let {style} = this;
		// Draw star
		style.drawLine(px, py, sx, sy, "white", t, "round", game.sound.beatOpacity);
	}
}

export let draw = new Draw