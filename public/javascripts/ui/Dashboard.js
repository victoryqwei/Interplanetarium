/*

Draws the dashboard for the game

*/

import Style from "../visuals/Style.js";
import {game} from "../game/Game.js";
import {input} from "../game/input.js";
import {QuadTree, Rectangle} from "../util/QuadTree.js"
import {camera} from '../visuals/Camera.js';
import {util} from "../util/Util.js";

window.hanvas = document.getElementById("interface-canvas");
window.htx = hanvas.getContext("2d");
hanvas.width = $("#interface-container").width();
hanvas.height = $("#interface-container").height();
$("#interface-container").css({'left': $(window).innerWidth()/2-hanvas.width/2})
$(window).resize(function () {
	hanvas.width = $("#interface-container").width();
	hanvas.height = $("#interface-container").height();
	$("#interface-container").css({'left': $(window).innerWidth()/2-hanvas.width/2})
})

util.dragElement(document.getElementById("interface-container"));


export default class Dashboard {
	constructor() {
		this.style = new Style(htx);

		this.spacing = 75;
		this.padding = 22;
	}

	draw() {
		
		if (!game.map || game.state != "play" || camera.warp)
			return;

		// Define
		let {style} = this;
		let rocket = game.rocket;

		// Clear canvas
		htx.clearRect(0, 0, hanvas.width, hanvas.height);

		// Draw background 
		style.drawRoundedRect(0, 0, hanvas.width, hanvas.height, 10, "white", {
			alpha: 0.1
		})

		// Draw integrity
		style.drawText("INTEGRITY", hanvas.width/2, hanvas.height/3, "18px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText(Math.max(Math.round(100 * rocket.integrity/rocket.maxIntegrity), 0), hanvas.width/2 - (ctx.measureText("%").width/2), hanvas.height/1.5, "45px Arial", "white", "center", "middle", 1)
		style.drawText("%", hanvas.width/2 + ((htx.measureText(Math.max(Math.round(100 * rocket.integrity/rocket.maxIntegrity), 0)).width)/2) - (ctx.measureText("%").width/2), hanvas.height/1.5 + 8, "12px Arial", "white", "left", "middle", 1);

		// Draw fuel
		style.drawText("FUEL", hanvas.width/2 - this.spacing*2, hanvas.height/3, "18px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText(Math.round(100 * rocket.fuel/rocket.maxFuel), hanvas.width/2 - (ctx.measureText("kL").width/2) - this.spacing*2, hanvas.height/1.5, "45px Arial", "white", "center", "middle", 1)
		style.drawText("kL", hanvas.width/2 - this.spacing*2 + ((htx.measureText(Math.round(100 * rocket.fuel/rocket.maxFuel)).width)/2) - (ctx.measureText("kL").width/2), hanvas.height/1.5 + 8, "12px Arial", "white", "left", "middle", 1);

		// Draw thrust
		style.drawText("SPEED", hanvas.width/2 + this.spacing*2, hanvas.height/3, "18px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText(Math.round(rocket.vel.getMag()), hanvas.width/2 - (ctx.measureText("kN").width/2) + this.spacing*2, hanvas.height/1.5, Math.round(rocket.thrust/10) == 100 ? "40px Arial" : "45px Arial", "white", "center", "middle", 1)
		style.drawText("km/h", hanvas.width/2 + this.spacing*2 + ((htx.measureText(Math.round(rocket.vel.getMag())).width)/2) - (ctx.measureText("kN").width/2), hanvas.height/1.5 + 8, "12px Arial", "white", "left", "middle", 1);

		// Draw separation lines
		style.drawLine(hanvas.width/2 - this.spacing, this.padding, hanvas.width/2 - this.spacing, hanvas.height - this.padding, "white", 1, "butt", 0.8);
		style.drawLine(hanvas.width/2 + this.spacing, this.padding, hanvas.width/2 + this.spacing, hanvas.height - this.padding, "white", 1, "butt", 0.8);

		// Set circle options
		let options = {
			fill: true,
			alpha: 0.5,
			glow: false
		}

		// Draw resource cirlces
		style.drawCircle(hanvas.width/2 - this.spacing * 3.5, hanvas.height/2, (hanvas.height-this.padding*2)/2 + 3, "green", options)
		style.drawCircle(hanvas.width/2 + this.spacing * 3.5, hanvas.height/2, (hanvas.height-this.padding*2)/2 + 3, "green", options)
		style.drawCircle(hanvas.width/2 - this.spacing * 4.7, hanvas.height/2, (hanvas.height-this.padding*2)/2 + 3, "green", options)
		style.drawCircle(hanvas.width/2 + this.spacing * 4.7, hanvas.height/2, (hanvas.height-this.padding*2)/2 + 3, "green", options)

		// Draw resource names
		style.drawText("Copper", hanvas.width/2 - this.spacing * 3.5, hanvas.height/2.6, "bold 14px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText("Iron", hanvas.width/2 + this.spacing * 3.5, hanvas.height/2.6, "bold 14px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText("Lead", hanvas.width/2 - this.spacing * 4.7, hanvas.height/2.6, "bold 14px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText("Kanium", hanvas.width/2 + this.spacing * 4.7, hanvas.height/2.6, "bold 14px Arial", "#9e9e9e", "center", "middle", 1);

		// Draw checkmarks
		style.drawCheckmark(hanvas.width/2 - this.spacing * 3.5 - 2, hanvas.height/1.75, 8, 3)
		style.drawCheckmark(hanvas.width/2 + this.spacing * 3.5 - 2, hanvas.height/1.75, 8, 3)
		style.drawCheckmark(hanvas.width/2 - this.spacing * 4.7 - 2, hanvas.height/1.75, 8, 3)
		style.drawCheckmark(hanvas.width/2 + this.spacing * 4.7 - 2, hanvas.height/1.75, 8, 3)
	}
}