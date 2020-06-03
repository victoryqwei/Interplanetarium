/*

In game interface 

*/
import Rocket from "../player/Rocket.js";
import Minimap from "./Minimap.js";
import {game} from "../game/Game.js";

export default class UI {
	constructor() {

		this.interfaceHeight = 100;
		this.interfaceWidth = 250;
		this.padding = 20;

		this.minimap = new Minimap();

	}

	draw() {
		this.drawMain();
		this.minimap.draw();
	}

	drawMain() {

		let rocket = game.rocket;

		drawText("FPS: " + averageFps.toFixed(2), 10, 20, "20px Arial", "white", "left", "middle", Math.min(game.sound.beatOpacity + 0.6, 1));
		drawText("Integrity: " + game.rocket.integrity, 10, 45, "20px Arial", "white", "left", "middle", Math.min(game.sound.beatOpacity + 0.6, 1));
		drawText("Fuel: " + Math.round(game.rocket.fuel), 10, 70, "20px Arial", "white", "left", "middle", Math.min(game.sound.beatOpacity + 0.6, 1));

		// Draw shape outlines
		if (display.state != "play")
			return;

		/*
		ctx.globalAlpha = 1;
		drawTrapezoid(canvas.width/2 - this.interfaceWidth / 2, canvas.height - this.padding, this.interfaceWidth, -this.interfaceHeight, this.interfaceWidth / 3.9);
		drawTriangle(canvas.width/2 - this.interfaceWidth / 1.8, canvas.height - this.interfaceHeight / 2 - this.padding + 2, this.interfaceWidth / 2 - 5, this.interfaceHeight - 5, 0, "white");
		drawTriangle(canvas.width/2 + this.interfaceWidth / 1.8, canvas.height - this.interfaceHeight / 2 - this.padding + 2, this.interfaceWidth / 2 - 5, this.interfaceHeight - 5, 0, "white");

		drawText("100%", canvas.width/2, canvas.height - this.padding * 2.5, "40px Arial", "white", "center", "middle", 1)*/
	}


}