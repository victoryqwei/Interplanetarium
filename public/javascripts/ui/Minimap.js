/*

Draws the minimap for the game

*/

import Util from "../util/Util.js";
import {game} from "../game/Game.js";
import {input} from "../game/input.js";
import {QuadTree, Rectangle} from "../util/QuadTree.js"

window.manvas = document.getElementById("minimap-canvas");
window.mtx = manvas.getContext("2d");
manvas.width = $("#minimap-container").width();
manvas.height = $("#minimap-container").height();
$(window).resize(function () {
	manvas.width = $("#minimap-container").width();
	manvas.height = $("#minimap-container").height();
})


dragElement(document.getElementById("minimap-container"));


export default class Minimap {
	constructor() {
		this.util = new Util(mtx);

		this.viewDistance = 1000;
		this.view = 4; // How far the minimap can see compared to the viewer's screen
	}

	draw() {
		if (!game.map || display.state != "play")
			return;

		let {util} = this;
		let rocket = game.rocket;

		mtx.clearRect(0, 0, manvas.width, manvas.height);

		// Draw background
		util.drawRoundedRect(0, 0, manvas.width, manvas.height, 10, "white", {
			alpha: 0.1
		})

		this.scale = this.viewDistance/manvas.height*this.view;
		
		let range = new Rectangle(rocket.pos.x, rocket.pos.y, this.viewDistance*this.view, this.viewDistance*this.view);
		let points = game.mapQ.query(range);

		for (let planet of points) {
			let p = planet.data;
			util.drawCircle(manvas.width/2 + (p.pos.x - rocket.pos.x) / this.scale, manvas.height/2 + (p.pos.y - rocket.pos.y) / this.scale, p.radius / this.scale, p.color);
		}

		// Draw navigation symbol
		util.drawTriangle(manvas.width/2, manvas.height/2, 10, 15, game.rocket.angle, "red");
	}
}