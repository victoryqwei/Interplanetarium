/*

Creates the map for the room with planets and alien structures

*/

var Vector = require('../util/Vector.js');
var Util = require('../util/Util.js');
var Planet = require('./Planet.js');

module.exports = class Map {
	constructor(numberOfPlanets, mapSize) {

		this.planetNumber = numberOfPlanets || 200;
		this.mapRadius = mapSize || 10000;
		this.massMultiplier = 1000; // How much the planet mass is multiplied by its radius
		this.earthRadius = 200;

		this.planets = {};

		// Generate map
		let t = Date.now();
		this.generateMap(this.planetNumber, this.mapRadius);
		console.log("Successfully built server map in", Date.now()-t, "ms");
	}

	generateMap(numberOfPlanets, radius) {
		// Initiate 
		this.planets[Util.randomString(8)] = new Planet(0, this.earthRadius, this.earthRadius * this.massMultiplier, this.earthRadius, "Planet", "Earth", "#0d7d93", "green");

		for (let i = 0; i < numberOfPlanets; i++) {
			this.planets[Util.randomString(8)] = this.generatePlanet(radius);
		}
	}

	generatePlanet(radius) {
		// Determine the type of planet (planet, blackhole, asteroid)
		let seed = Math.random();
		let randRadius;
		let minSpawnDistance = 0; // How much the planets must be separated by

		if (seed < 95/100) {
			seed = "planet";
			randRadius = Util.randInt(100, 300);
			minSpawnDistance = 200;
		} else if (seed < 98/100) {
			seed = "blackhole";
			randRadius = 75;
			minSpawnDistance = 1000;
		} else {
			seed = "kanus minimus";
			randRadius = 100;
			minSpawnDistance = 200;
		}
	   
	   	// Randomly generate position until it meets the criteria
	   	let randPos = new Vector();
	   	let generated = false;
	   	while (!generated) {
	   		// Creating new planets	 

			randPos = Util.randCircle(radius);

	    	let validPosition = true;

	    	// Check for valid spawning location
	    	for (let id in this.planets) {
	    		let p = this.planets[id];
				if (Util.dist(new Vector(randPos.x, randPos.y), p.pos) < p.radius + randRadius + minSpawnDistance) {
					validPosition = false;
				}
			}

			if (validPosition)
				generated = true;
	   	}
	    	

		// Randomly create planets / black holes based on seed
		if(seed == "planet") {
	    	// Create planets
	    	return new Planet(randPos.x, randPos.y, randRadius * this.massMultiplier, randRadius, "Planet", planetNames[Util.randInt(0, planetNames.length-1)], Util.getRandomColor())
		} else if (seed == "blackhole") {
			// Create black hole
	   		return new Planet(randPos.x, randPos.y, 5000000, 75, "Black Hole", "Black Hole", "#000000", "black");
		} else if (seed = "kanus minimus") {
			// Create planets
	    	return new Planet(randPos.x, randPos.y, 1000, randRadius, "Planet", "Kanus Minimus", "#ffffff");
		}	
	}
}