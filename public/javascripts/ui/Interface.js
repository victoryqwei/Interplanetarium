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

	}

	draw() {
		this.dashboard.draw();
		this.minimap.animate();
		this.drawPlanetUI();
		this.drawStats();
		this.drawLog();
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
	
				ctx.font = 80*zoom + "px Arial";
				var amount = Math.round(100 * p.resource.amount/p.resource.totalAmount);
				let width = ctx.measureText(amount).width

				drawText(p.resource.type, planet.x, planet.y - 40*zoom, 40*zoom + "px Arial", "white", "center", "middle", 1);
				drawText(Math.round(100 * p.resource.amount/p.resource.totalAmount), planet.x, planet.y + 20*zoom, 80*zoom + "px Arial", "white", "center", "middle", 1);
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
}