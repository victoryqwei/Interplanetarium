/*

Draws the minimap for the game

*/

import Style from "../visuals/Style.js";
import {game} from "../game/Game.js";
import {input} from "../game/input.js";
import {QuadTree, Rectangle} from "../util/QuadTree.js"
import {camera} from '../visuals/Camera.js';
import {util} from "../util/Util.js";

window.manvas = document.getElementById("minimap-canvas");
window.mtx = manvas.getContext("2d");
manvas.width = $("#minimap-container").width();
manvas.height = $("#minimap-container").height();
$(window).resize(function () {
	manvas.width = $("#minimap-container").width();
	manvas.height = $("#minimap-container").height();
})

util.dragElement(document.getElementById("minimap-container"));


export default class Minimap {
	constructor() {
		this.style = new Style(mtx);

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

		let zoom = camera.zoom;
		let rocket = game.rocket;

		// Update radar objects
		let range = new Rectangle(rocket.pos.x, rocket.pos.y, this.radarDistance, this.radarDistance);
		if (camera.warp)
			range = new Rectangle(0, 0, game.map.mapRadius, game.map.mapRadius);
		let points = game.mapQ.query(range);

		for (let p of points) {
			game.radar.planets[p.data.id] = p.data;
		}
	}

	draw() {
		if (!game.map || game.state != "play" || camera.warp)
			return;

		let {style} = this;
		let rocket = game.rocket;

		mtx.clearRect(0, 0, manvas.width, manvas.height);

		// Draw background 
		style.drawRoundedRect(0, 0, manvas.width, manvas.height, 10, "white", {
			alpha: 0.1
		})

		this.scale = this.radarDistance/manvas.height;

		for (let id in game.radar.planets) {
			let p = game.radar.planets[id];
			// Draw on the minimap
			style.drawCircle(manvas.width/2 + (p.pos.x - rocket.pos.x) / this.scale, manvas.height/2 + (p.pos.y - rocket.pos.y) / this.scale, p.radius / this.scale, p.color);
			if (p.type == "blackhole") {
				style.drawText("!", manvas.width/2 + (p.pos.x - rocket.pos.x) / this.scale, manvas.height/2 + (p.pos.y - rocket.pos.y) / this.scale, "Bold 25px Arial", "red", "center", "middle", 1);
			}
		}

		// Draw navigation symbol
		style.drawCompass(manvas.width/2, manvas.height/2, 12, 17, game.rocket.angle, "red");

		// Draw the players on the minimap
		for (let id in game.players) {
			if (id == socket.id)
				continue;
			let p = game.players[id].rocket;
			if (!p.alive)
				return;
			style.drawCompass(manvas.width/2 + (p.pos.x - rocket.pos.x) / this.scale, manvas.height/2 + (p.pos.y - rocket.pos.y) / this.scale, 12, 17, p.angle, "white");
		}
	}	
}