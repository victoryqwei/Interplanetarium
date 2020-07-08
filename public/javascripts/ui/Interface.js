/*

In game interface 

*/
import Style from "../visuals/Style.js";
import Rocket from "../player/Rocket.js";
import Minimap from "./Minimap.js";
import Dashboard from "./Dashboard.js";
import {game} from "../game/Game.js";
import {util} from "../util/Util.js";
import {camera} from "../visuals/Camera.js";


export default class UI {
	constructor() {

		this.style = new Style(ctx);
		this.interfaceHeight = 100;
		this.interfaceWidth = 250;
		this.padding = 20;
		this.minimap = new Minimap();
		this.dashboard = new Dashboard();
	}

	draw() {
		this.dashboard.draw();
		this.minimap.animate();
		this.drawPlanetUI();
		this.drawStats();1
		this.drawLog();
		if(!game.rocket.alive) {
			this.drawDeath();
		}
	}

	drawPlanetUI() {

		let {style} = this;

		let zoom = camera.zoom;

		if (game.screen && !camera.warp) {
			for (let id in game.screen.planets) {
				let p = game.screen.planets[id];
				if(p.type == "blackhole")
					break;
				let planet = util.getScreenPos(p.pos, zoom, camera.pos);
				// Draw planet name
				style.drawText(p.name, planet.x, planet.y, p.radius/4*zoom + "px Arial", "white", "center", "middle", 1);
			}
		}
	}

	drawStats() {
		let {style} = this;
		let rocket = game.rocket;

		// Stats
		style.drawText("FPS: " + averageFps.toFixed(2), 20, 30, "20px Arial", "white", "left", "middle", 1);
		style.drawText("TPS: " + averageTps.toFixed(1) + " | 30.0", 20, 60, "20px Arial", "white", "left", "middle", 1);
		style.drawText("Latency: " + averageLatency.toFixed(0) + "ms", 20, 90, "20px Arial", "white", "left", "middle", 1);
		style.drawText("G-Force: " + game.rocket.gForce.toFixed(1), 20, 120, "20px Arial", "white", "left", "middle", 1);
		style.drawText("Acceleration: " + game.rocket.acc.getMag().toFixed(1), 20, 150, "20px Arial", "white", "left", "middle", 1);
		style.drawText("Velocity: " + game.rocket.vel.getMag().toFixed(1), 20, 180, "20px Arial", "white", "left", "middle", 1);

		if (game.map) {
			style.drawText("STAGE", canvas.width - 65, 40, "bold 20px Arial", "white", "center", "middle", 1);
			style.drawText(game.map.stage + 1, canvas.width - 65, 80, "bold 55px Arial", "white", "center", "middle", 1);
		}

		if (rocket.mortalCourse) {
			style.drawWarning(canvas.width/2, canvas.height/4, 110, 100, 0, "red", 0.5);
			style.drawText("WARNING", canvas.width/2, canvas.height/4 + 100, "bold 50px Arial", "red", "center", "middle", 0.8);
			style.drawText("Rocket Collision Imminent", canvas.width/2, canvas.height/4 + 150, "bold 30px Arial", "white", "center", "middle", 0.8);
			style.drawText("Distance: " + Math.round(rocket.mortalCourse) + " km", canvas.width/2, canvas.height/4 + 180, "bold 20px Arial", "white", "center", "middle", 0.8);
		}
	}

	drawLog() {

		let {style} = this;

		for (var i = 0; i < game.log.length; i++) {
			style.drawText(game.log[i], canvas.width - 20, canvas.height - 20 - 25*i, "20px Arial", "white", "right", "middle", 1);
		}
	}

	drawDeath() {
		let {style} = this;
		style.drawRectangle(0, 0, canvas.width, canvas.height, "black", {alpha: 0.6});
		style.drawText("YOU DIED", canvas.width/2, canvas.height/3, "bold 80px Arial", "white", "center", "middle", 1);
		style.drawText("Really, what were you thinking?", canvas.width/2, canvas.height/2.5, "bold 30px Arial", "white", "center", "middle", 1);
		style.drawText("RESPAWN", canvas.width/2, canvas.height/1.5, "bold 40px Arial", "white", "center", "middle", 1);
		$("#minimap-container").hide();
		$("#interface-container").hide();
	}
}