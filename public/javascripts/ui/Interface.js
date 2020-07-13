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

		// Define interface
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
		// Draw the fade to black for transitions
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
		// Draw the main menu of the game
		let {style} = this;
		let width = canvas.width/4;
		let subWidth = canvas.width/20;
		let opacity = Math.min(game.sound.beatOpacity+0.6, 1);

		// Draw menu
		ctx.globalAlpha = opacity;
		style.drawImage(images.title, canvas.width/2, canvas.height/4, width, width/3.7);
		style.drawImage(images.launch, canvas.width/2, canvas.height/1.4, subWidth, subWidth/3.7);

		let cursor = Date.now() % 1000 > 500 ? "|" : ""
		style.drawText(window.username + cursor, canvas.width/2 + (cursor.length > 0 ? 9 : 0), canvas.height/1.9, "70px Arial", "white", "center", "middle", opacity);
		style.drawText("Created by Victor Wei and Evan Cowan", canvas.width/2, canvas.height - 20, "bold 15px Arial", "white", "center", "middle", opacity);
		ctx.globalAlpha = 1;
	}

	drawWarpText() {
		// Draw the hyperjump text for the player
		let {style} = this;

		// Stats
		style.drawText('\uf0aa', canvas.width/2, canvas.height - canvas.height/3.2, '75px "FontAwesome"', "lime", "center", "middle", 1);
		style.drawText("Press space to hyperjump!", canvas.width/2, canvas.height - canvas.height/4, "bold 30px Arial", "lime", "center", "middle", 1);
	}

	drawStats() {
		// Draw the stats of the game in the top left
		let {style} = this;
		let rocket = game.rocket;

		let spacing = 6
		let padding = 20;

		// Draw fps
		let fps = maxFps / averageFps;
		style.drawRoundedRect(padding + spacing*2.5 - padding*1.6/2, padding - (padding*fps - padding), padding*1.6, padding*fps, 4, "#cfcfcf", {fill: true});
		style.drawRoundedRect(padding + spacing*2.5 - padding*1.6/2, padding, padding*1.6, padding, 4, "white", {fill: false, outline: true, outlineWidth: 4, outlineColor: "white"})
		style.drawText(averageFps.toFixed(0), padding + spacing*2.5, padding*2+9, "bold 20px Arial", "white", "center", "top", 1);

		// Draw latency
		let latency = Math.max(5-(averageLatency/20), 0);
		style.drawRectangle(padding + spacing*0, padding*4+20, 5, 5, "rgba(255, 255, 255, " + Math.max(latency+1, 0) + ")");
		style.drawRectangle(padding + spacing*1, padding*4+15, 5, 10, "rgba(255, 255, 255, " + Math.max(latency, 0) + ")");
		style.drawRectangle(padding + spacing*2, padding*4+10, 5, 15, "rgba(255, 255, 255, " + Math.max(latency-1, 0) + ")");
		style.drawRectangle(padding + spacing*3, padding*4+5, 5, 20, "rgba(255, 255, 255, " + Math.max(latency-2, 0) + ")");
		style.drawRectangle(padding + spacing*4, padding*4, 5, 25, "rgba(255, 255, 255, " + Math.max(latency-3, 0) + ")");
		style.drawText(averageLatency.toFixed(0), padding + spacing*2.5, padding*5+9, "bold 20px Arial", "white", "center", "top", 1);

		// Draw tps
		let tps = averageTps / 30;
		style.drawCircle(padding + spacing*2.5, padding*7.9, padding/1.5, "white", {outline: true, fill: false, outlineColor: "white", outlineWidth: 7});
		style.drawCircle(padding + spacing*2.5, padding*7.9, padding/1.5, "white", {outline: true, fill: false, outlineColor: tps > 1 ? "red" : "lime", outlineWidth: 7}, tps > 1 ? Math.PI*1.5 - (Math.PI*(1-tps)) : Math.PI*1.5, tps > 1 ? Math.PI*1.5 : Math.PI*1.5 - (Math.PI*(1-tps)));
		style.drawText(averageTps.toFixed(0), padding + spacing*2.5, padding*9, "bold 20px Arial", "white", "center", "top", 1);

		// Stage and lives
		if (game.map && !camera.warp) {
			style.drawText("STAGE", canvas.width - 65, 40, "bold 20px Arial", "white", "center", "middle", 1);
			style.drawText(game.map.stage + 1, canvas.width - 65, 80, "bold 55px Arial", "white", "center", "middle", 1);
			style.drawText("LIVES", canvas.width - 65, 120, "bold 20px Arial", "white", "center", "middle", 1);
			style.drawText(game.rocket.lives, canvas.width - 65, 160, "bold 55px Arial", "white", "center", "middle", 1);
		}

		// Collision warning
		if (rocket.mortalCourse) {
			style.drawWarning(canvas.width/2, canvas.height/4, 110, 100, 0, "red", 0.5);
			style.drawText("WARNING", canvas.width/2, canvas.height/4 + 100, "bold 50px Arial", "red", "center", "middle", 0.8);
			style.drawText("Rocket Collision Imminent", canvas.width/2, canvas.height/4 + 150, "bold 30px Arial", "white", "center", "middle", 0.8);
			style.drawText("Distance: " + Math.round(rocket.mortalCourse) + " km", canvas.width/2, canvas.height/4 + 180, "bold 20px Arial", "white", "center", "middle", 0.8);
		}
	}

	drawLog() {
		// Draw the game log used for player death events
		let {style} = this;
		for (var i = 0; i < game.log.length; i++) {
			style.drawText(game.log[i], canvas.width - 20, canvas.height - 20 - 25*i, "20px Arial", "white", "right", "middle", 1);
		}
	}

	drawDeath() {
		// Draw the countdown timer and replay edge effects
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