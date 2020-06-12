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

		this.radarDistance = 4000;
	}

	animate() {
		this.updateRadar();
		this.draw();
	}

	updateRadar() {
		if (!game.mapQ)
			return;

		// Update the objects that are in the screen
		game.radar = {
			planets: {},
			players: {}
		}

		let zoom = display.zoom;
		let rocket = game.rocket;

		// Update radar objects
		let range = new Rectangle(rocket.pos.x, rocket.pos.y, this.radarDistance, this.radarDistance);
		if (display.warp)
			range = new Rectangle(0, 0, game.map.mapRadius, game.map.mapRadius);
		let points = game.mapQ.query(range);

		for (let p of points) {
			game.radar.planets[p.data.id] = p.data;
		}
	}

	draw() {
		if (!game.map || display.state != "play" || display.warp)
			return;

		let {util} = this;
		let rocket = game.rocket;

		mtx.clearRect(0, 0, manvas.width, manvas.height);

		// Draw background 
		util.drawRoundedRect(0, 0, manvas.width, manvas.height, 10, "white", {
			alpha: 0.1
		})

		this.scale = this.radarDistance/manvas.height;

		for (let id in game.radar.planets) {
			let p = game.radar.planets[id];
			// Draw on the minimap
			util.drawCircle(manvas.width/2 + (p.pos.x - rocket.pos.x) / this.scale, manvas.height/2 + (p.pos.y - rocket.pos.y) / this.scale, p.radius / this.scale, p.color);
			if (p.type == "Black Hole") {
				util.drawText("!", manvas.width/2 + (p.pos.x - rocket.pos.x) / this.scale, manvas.height/2 + (p.pos.y - rocket.pos.y) / this.scale, "Bold 25px Arial", "red", "center", "middle", 1);
			}
		}

		// Draw the players on the minimap
		for (let id in game.players) {
			if (id == socket.id)
				continue;
			
			let p = game.players[id].rocket;
			util.drawCompass(manvas.width/2 + (p.pos.x - rocket.pos.x) / this.scale, manvas.height/2 + (p.pos.y - rocket.pos.y) / this.scale, 12, 17, p.angle, "white");
		}

		// Draw navigation symbol
		util.drawCompass(manvas.width/2, manvas.height/2, 12, 17, game.rocket.angle, "red");
	}
}