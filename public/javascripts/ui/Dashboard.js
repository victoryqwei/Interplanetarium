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

		// Dashbaord sizing
		this.spacing = 75;
		this.padding = 22;
		this.xp = 0;
		this.prevXp = 0;
		this.xpDelay = 0;
		this.xpDelta = 0;
		this.fullXp = false;

	}

	draw() {

		if (!game.map)
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

		ctx.font = "12px Arial";
		htx.font = "45px Arial";

		// Draw stage differences
		let leftText = "Stage " + (game.map.stage + 1);
		style.drawText(leftText, hanvas.width/2 - 200, 8, "14px Arial", "white", "left", "top")
		let leftTextWidth = htx.measureText(leftText).width + 5;

		let rightText = "Stage " + (game.map.stage + 2);
		style.drawText(rightText, hanvas.width/2 + 200, 8, "14px Arial", "white", "right", "top")
		let rightTextWidth = htx.measureText(rightText).width;

		// Animate XP bar
		let xpHeight = 12;
		let xpWidth = 400 - leftTextWidth - rightTextWidth - 10;
		let stageXp = game.map.stage*100+100;
 		let xpProgress = Math.min((game.rocket.xp/stageXp), 1);

 		if (game.rocket.xp == 0) {
 			this.xp = 0;
 		}
 		if (this.prevXp < game.rocket.xp) {
 			this.xp += xpWidth*xpProgress - xpWidth*(this.prevXp/stageXp);
 			this.xpDelta = this.xp;
 		}
 		this.prevXp = game.rocket.xp;
 		if (this.xp > 0) {
 			this.xp -= (0.05*Math.min(this.xpDelta/this.xp, 2))*delta;
 		}

 		// Draw XP bar
		if (xpProgress >= 1) { 
			style.drawRectangle(hanvas.width/2 - 200 + leftTextWidth, 8, xpWidth, xpHeight, "lime", {alpha: 1});
		} else {
			style.drawRectangle(hanvas.width/2 - 200 + leftTextWidth, 8, xpWidth, xpHeight, "white", {alpha: 0.2});
			style.drawRectangle(hanvas.width/2 - 200 + leftTextWidth, 8, xpWidth*xpProgress - this.xp, xpHeight, "white", {alpha: 0.8});
			style.drawRectangle(hanvas.width/2 - 200 + xpWidth*xpProgress - this.xp + leftTextWidth, 8, this.xp, xpHeight, "lime", {alpha: 1});
		}

		// Reset XP
		this.fullXp = xpProgress >= 1;

		// Animate vitals
		let vitalHeight = 100;
		let heightDiff = hanvas.height - vitalHeight;

		// Draw integrity
		let integrityValue = Math.max(Math.round(100 * rocket.integrity/rocket.maxIntegrity), 0);
		style.drawText("INTEGRITY", hanvas.width/2, vitalHeight/2.8 + heightDiff, "18px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText(integrityValue, hanvas.width/2 - (ctx.measureText("%").width/2), vitalHeight/1.4 + heightDiff, "45px Arial", "white", "center", "middle", 1)
		style.drawText("%", hanvas.width/2 + ((htx.measureText(Math.max(Math.round(100 * rocket.integrity/rocket.maxIntegrity), 0)).width)/2) - (ctx.measureText("%").width/2), vitalHeight/1.8 + 8 + heightDiff, "12px Arial", "white", "left", "middle", 1);

		// Draw fuel
		let fuelValue = Math.round(100 * rocket.fuel/rocket.maxFuel);
		style.drawText("FUEL", hanvas.width/2 - this.spacing*2, vitalHeight/2.8 + heightDiff, "18px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText(fuelValue, hanvas.width/2 - (ctx.measureText("kL").width/2) - this.spacing*2, vitalHeight/1.4 + heightDiff, "45px Arial", "white", "center", "middle", 1)
		style.drawText("kL", hanvas.width/2 - this.spacing*2 + ((htx.measureText(Math.round(100 * rocket.fuel/rocket.maxFuel)).width)/2) - (ctx.measureText("kL").width/2), vitalHeight/1.8 + 8 + heightDiff, "12px Arial", "white", "left", "middle", 1);

		// Draw thrust
		let speedValue = Math.round(rocket.vel.getMag());
		style.drawText("SPEED", hanvas.width/2 + this.spacing*2, vitalHeight/2.8 + heightDiff, "18px Arial", "#9e9e9e", "center", "middle", 1);
		style.drawText(speedValue, hanvas.width/2 - (ctx.measureText("kN").width/2) + this.spacing*2, vitalHeight/1.4 + heightDiff, Math.round(rocket.thrust/10) == 100 ? "40px Arial" : "45px Arial", "white", "center", "middle", 1)
		style.drawText("km/h", hanvas.width/2 + this.spacing*2 + ((htx.measureText(Math.round(rocket.vel.getMag())).width)/2) - (ctx.measureText("kN").width/2), vitalHeight/1.8 + 8 + heightDiff, "12px Arial", "white", "left", "middle", 1);

		// Draw separation lines
		style.drawLine(hanvas.width/2 - this.spacing, this.padding + 15/2 + heightDiff, hanvas.width/2 - this.spacing, vitalHeight - this.padding + 15/2 + heightDiff, "white", 1, "butt", 0.8);
		style.drawLine(hanvas.width/2 + this.spacing, this.padding + 15/2 + heightDiff, hanvas.width/2 + this.spacing, vitalHeight - this.padding + 15/2 + heightDiff, "white", 1, "butt", 0.8);
	}
}