function updateProjectiles() {
	for (let i = projectiles.length-1; i >= 0; i--) {
		let p = projectiles[i];

		if (p.collided) {
			p.t += delta;
			if (p.t > 200) {
				projectiles.splice(i, 1);
			}
		} else {
			var old = Date.now() - p.time > 5000;
			var newProjectile = Date.now() - p.time > 200;
			var collision = false;

			for (let id in planets) {
				let p2 = planets[id];
				if (dist(p.pos, p2.pos) < p2.radius + 5) {
					collision = true;
				}
			}

			for (let id in server.players) {
				let p3 = server.players[id];
				if (dist(p.pos, p3.pos) < 50 && id != socket.id && p.id != id) {
					collision = true;
				}
			}

			if (dist(new Vector(), p.pos) > server.map.mapRadius + 1000) { // out of bounds projectile
				collision = true;
			}

			if ((old || collision)) { // Collision
				p.collided = true;
				p.t = 0;

				let turretBullet = Date.now()-p.time < 50 && p.type == "turret";

				if (display.performanceMode || turretBullet)
					projectiles.splice(i, 1);
			} else { // Update position
				var deltaPos = new Vector(p.heading.x, p.heading.y);
				deltaPos.mult(delta);
				p.pos.x += p.speed*deltaPos.x + p.vel.x*delta/1000;
				p.pos.y += p.speed*deltaPos.y + p.vel.y*delta/1000;
			}
		}
			
	}
}

function displayProjectiles() {
	var zoom = display.zoom;
	for (let i = projectiles.length-1; i >= 0; i--) {
		let p = projectiles[i];
		if (inScreen(p.pos)) {
			var screenPos = getScreenPos(p.pos, zoom);

			let color = "red";
			if (p.type == "player") {
				color = "lime";
			}

			if (p.collided) {
				let options = {
					outline: true,
					outlineWidth: 2-(0.5/display.zoom),
					outlineColor: color,
					fill: false
				}
				drawCircle(screenPos.x, screenPos.y, p.t/50, color, options);
			} else {
				drawRect(screenPos.x, screenPos.y, 8*zoom, 2*zoom, p.angle, color);
			}
		}
	}
}