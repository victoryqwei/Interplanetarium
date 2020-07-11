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
import {images} from "../world/assets.js";

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
		if(!camera.warp) {
			if (game.state == "replay" || !game.rocket.alive) {
				this.drawFade();
				this.drawDeath();
			}
			if(game.state == "play" && game.rocket.alive)
				this.drawStats();
				this.drawLog();
				this.dashboard.draw();
				this.minimap.animate();
			if(this.dashboard.fullXp)
				this.drawWarpText();		
			if(game.state == "menu") {
				this.drawMenu();
			}
		}
	}

	drawFade() {
		let {style} = this;

		let time = Date.now() - game.rocket.deathTick;
		let alpha = 0;

		// Define opacity
		let seconds = time/1000;
		if (time <= 1000) {
			alpha = seconds;
		} else if (time > 1000 && time < 2000) {
			alpha = 1;
		} else if (time >= 2000 && time < 3000) {
			alpha = 3-seconds;
		}

		// Add fade to screen
		if (time < 3000)
			style.drawRectangle(0, 0, canvas.width, canvas.height, "black", {alpha: alpha})
		
	}

	drawMenu() {
		let {style} = this;
		let width = canvas.width/4;
		let subWidth = canvas.width/20;

		// Draw menu
		style.drawImage(images.title, canvas.width/2, canvas.height/4, width, width/3.7);
		style.drawImage(images.launch, canvas.width/2, canvas.height/1.4, subWidth, subWidth/3.7);

		let cursor = Date.now() % 1000 > 500 ? "|" : ""
		style.drawText(window.username + cursor, canvas.width/2 + (cursor.length > 0 ? 9 : 0), canvas.height/1.9, "70px Arial", "white", "center", "middle", 1);
		style.drawText("Created by Victor Wei and Evan Cowan", canvas.width/2, canvas.height - 20, "bold 15px Arial", "white", "center", "middle", 1);
	}

	drawWarpText() {
		let {style} = this;

		// Stats
		style.drawText('\uf0aa', canvas.width/2, canvas.height - canvas.height/3.2, '75px "FontAwesome"', "lime", "center", "middle", 1);
		style.drawText("Press space to hyperjump!", canvas.width/2, canvas.height - canvas.height/4, "bold 30px Arial", "lime", "center", "middle", 1);
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

		if (game.map && !camera.warp) {
			style.drawText("STAGE", canvas.width - 65, 40, "bold 20px Arial", "white", "center", "middle", 1);
			style.drawText(game.map.stage + 1, canvas.width - 65, 80, "bold 55px Arial", "white", "center", "middle", 1);
			style.drawText("LIVES", canvas.width - 65, 120, "bold 20px Arial", "white", "center", "middle", 1);
			style.drawText(game.rocket.lives, canvas.width - 65, 160, "bold 55px Arial", "white", "center", "middle", 1);
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

		// Draw game log
		for (var i = 0; i < game.log.length; i++) {
			style.drawText(game.log[i], canvas.width - 20, canvas.height - 20 - 25*i, "20px Arial", "white", "right", "middle", 1);
		}
	}

	drawDeath() {
		if (camera.warp)
			return;

		let {style} = this;

		let padding = 60;
		let length = 100;

		// Top Left corner
		style.drawLine(padding, padding, padding, padding + length, "white", 6, "square", 1)
		style.drawLine(padding, padding, padding + length, padding, "white", 6, "square", 1)

		// Top Right corner
		style.drawLine(canvas.width - padding, padding, canvas.width - padding - length, padding, "white", 6, "square", 1)
		style.drawLine(canvas.width - padding, padding, canvas.width - padding, padding + length, "white", 6, "square", 1)

		// Bottom Left corner
		style.drawLine(padding, canvas.height - padding, padding, canvas.height - padding - length, "white", 6, "square", 1)
		style.drawLine(padding, canvas.height - padding, padding + length, canvas.height - padding, "white", 6, "square", 1)

		// Bottom Right corner
		style.drawLine(canvas.width - padding, canvas.height - padding, canvas.width - padding - length, canvas.height - padding, "white", 6, "square", 1)
		style.drawLine(canvas.width - padding, canvas.height - padding, canvas.width - padding, canvas.height - padding - length, "white", 6, "square", 1)

  		let respawnTimer = (Math.round(Math.max(((game.rocket.respawnTime + 2000)/1000 - (Date.now() - game.rocket.deathTick)/1000), 0) * 10) / 10).toFixed(1)
  		style.drawText("DEATH RECAP", canvas.width/2, padding + length/2, "bold 50px Arial", "white", "center", "middle", 1);
  		if (game.rocket.lives > 0)
			style.drawText("RESPAWN IN " + respawnTimer + " SECONDS", canvas.width/2, padding + length, "bold 30px Arial", "white", "center", "middle", 1);
		else
			style.drawText("RETURNING TO MENU IN " + respawnTimer + " SECONDS", canvas.width/2, padding + length, "bold 30px Arial", "white", "center", "middle", 1);
		$("#minimap-container").hide();
		$("#interface-container").hide();
	}
}