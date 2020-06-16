/*

In game interface 

*/
import Util from "../util/Util.js";
import Rocket from "../player/Rocket.js";
import Minimap from "./Minimap.js";
import Dashboard from "./Dashboard.js";
import {game} from "../game/Game.js";


export default class UI {
	constructor() {

		this.util = new Util(ctx);
		this.interfaceHeight = 100;
		this.interfaceWidth = 250;
		this.padding = 20;
		this.minimap = new Minimap();
		this.dashboard = new Dashboard();

		this.damage = {
			integrity: game.rocket.integrity,
			draw: 0
		}

	}

	draw() {
		this.drawDamage();
		this.dashboard.draw();
		this.minimap.animate();
		this.drawPlanetUI();
		this.drawStats();
		this.drawLog();
		if(!game.rocket.alive) {
			this.drawDeath();

		}
	}

	drawPlanetUI() {
		let zoom = display.warp ? display.mapZ : display.zoom;

		if(game.screen && !display.warp) {
			for (let id in game.screen.planets) {
				let p = game.screen.planets[id];
				if(p.type == "Black Hole")
					break;
				let planet = getScreenPos(p.pos, zoom, game.rocket.pos);
				let rocket = new Vector(canvas.width/2, canvas.height/2);
	
				ctx.font = p.radius/4*zoom + "px Arial";
				var amount = Math.round(100 * p.resource.amount/p.resource.totalAmount);
				let width = ctx.measureText(amount).width
				let planetText = ctx.measureText(p.name).width
			/*	let difference = p.radius/4*zoom - planetText/2;
				let combined = 20 - difference*/

				drawText(p.name, planet.x, planet.y - 40*zoom, p.radius/4*zoom + "px Arial", "white", "center", "middle", 1);
				drawText(Math.round(100 * p.resource.amount/p.resource.totalAmount), planet.x, planet.y + 25*zoom, p.radius/4*zoom + "px Arial", "white", "center", "middle", 1);
				drawText("%", planet.x + width/2, planet.y + 20*zoom + 15*zoom, 20*zoom + "px Arial", "white", "left", "middle", 1);
			}
		}
	}

	drawStats() {
		let {util} = this;
		let rocket = game.rocket;

		drawText("FPS: " + averageFps.toFixed(2), 20, 30, "20px Arial", "white", "left", "middle", 1);
		drawText("TPS: " + averageTps.toFixed(1) + " | 30.0", 20, 60, "20px Arial", "white", "left", "middle", 1);
		drawText("Latency: " + averageLatency.toFixed(0) + "ms", 20, 90, "20px Arial", "white", "left", "middle", 1);
		drawText("G-Force: " + game.rocket.gForce.toFixed(1), 20, 120, "20px Arial", "white", "left", "middle", 1);
		drawText("Acceleration: " + game.rocket.acc.getMag().toFixed(1), 20, 150, "20px Arial", "white", "left", "middle", 1);
		drawText("Velocity: " + game.rocket.vel.getMag().toFixed(1), 20, 180, "20px Arial", "white", "left", "middle", 1);

		if (rocket.mortalCourse) {
			util.drawWarning(canvas.width/2, canvas.height/4, 110, 100, 0, "red", 0.5);
			drawText("WARNING", canvas.width/2, canvas.height/4 + 100, "bold 50px Arial", "red", "center", "middle", 0.8);
			drawText("Rocket Collision Imminent", canvas.width/2, canvas.height/4 + 150, "bold 30px Arial", "white", "center", "middle", 0.8);
			drawText("Distance: " + Math.round(rocket.mortalCourse) + " km", canvas.width/2, canvas.height/4 + 200, "bold 20px Arial", "white", "center", "middle", 0.8);
		}
	}

	drawLog() {

		for (var i = 0; i < game.log.length; i++) {
			drawText(game.log[i], canvas.width - 20, canvas.height - 20 - 25*i, "20px Arial", "white", "right", "middle", 1);
		}
	}

	drawDeath() {
		let {util} = this;
		util.drawRectangle(0, 0, canvas.width, canvas.height, "black", {alpha: 0.6});
		drawText("YOU DIED", canvas.width/2, canvas.height/3, "bold 80px Arial", "white", "center", "middle", 1);
		drawText("Really, what were you thinking?", canvas.width/2, canvas.height/2.5, "bold 30px Arial", "white", "center", "middle", 1);
		drawText("RESPAWN", canvas.width/2, canvas.height/1.5, "bold 40px Arial", "white", "center", "middle", 1);
		$("#minimap-container").hide();
		$("#interface-container").hide();
	}

	drawDamage() {

		if(this.damage.integrity > game.rocket.integrity) {
			this.damage.draw = 5*delta;
			this.damage.integrity = game.rocket.integrity;
		}


		if(this.damage.draw > 0) {
			let {util} = this;

			let width = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
			let ratio = canvas.width / canvas.height;
			let height = ratio * width;

			var gradient = ctx.createRadialGradient(0, 0, canvas.height/2, 0, 0, canvas.width/2);
			gradient.addColorStop(0, "transparent");
			gradient.addColorStop(0.5, "red");
			
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 0.5;
			ctx.translate(canvas.width/2, canvas.height/2);
			ctx.scale(ratio, 1);
			ctx.fillStyle = gradient;
			ctx.arc(0, 0, width/2, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
			this.damage.draw--;
		}
	}
}