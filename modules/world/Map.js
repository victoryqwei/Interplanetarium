/*

Creates the map for the room with planets and alien structures

*/

var Vector = require('../util/Vector.js');
var Util = require('../util/Util.js');
var Planet = require('./Planet.js');

var planetNames = ["Onvoacury","Tephoatov","Thucurn","Yethiri","Seutera","Zeanope","Ziceter","Phipehines","Lladus XF","Cagua JBR","Xankehines","Zelnionerth","Polvore","Xunvichi","Azuno","Buinus","Diizuno","Llachogawa","Phorth OG1","Liuq EXB","Illoustea","Xellenides","Minkore","Melvagua","Miphus","Dotania","Seluruta","Bavalea","Groria FPVC","Soria 0OG","Xethiebos","Posaiyama","Nocrinda","Thaphade","Sigawa","Uiwei","Crukiruta","Sevuturn","Gruna 4L1","Goth M","Tegneivis","Ronkeostea","Mallarvis","Allypso","Theturn","Yielia","Thexazuno","Golunides","Zapus 2E3","Crara 2L","Chinkutune","Olnilea","Vozone","Lonroth","Baohiri","Vivis","Gnochoruta","Griezuno","Chade 7FD5","Bradus 2","Dinionope","Sinazuno","Gotrion","Idiea","Beutune","Lieter","Phaezuno","Brakuter","Chonoe 6010","Stroria 76","Zonkorilia","Zignaimia","Nebyke","Chenvade","Dealara","Puturn","Striaturn","Brepolea","Gillon 2BX","Cara 4L3","Chudiugawa","Cholelia","Gozinda","Xaleon","Zionides","Diewei","Lluniliv","Muoturn","Streon 4TV","Crara N08","Xugreter","Tubiegawa","Xudars","Gozars","Zaophus","Yuliv","Gechucarro","Dokecury","Geron VQ2","Cippe 7EWH","Aveclite","Yiphaimia","Alloth","Odade","Aitov","Alia","Crumonope","Phoustea","Phion WFW","Strion 2F0Q","Rethuiter","Thusaruta","Mucrinda","Adyria","Lonia","Havis","Drapiwei","Ciohiri","Llilia 3HVW","Gore PI","Chustretania","Nubbicarro","Guvillon","Yennoth","Xunides","Paophus","Broetis","Saroter","Brora 371","Sorix MHO","Zidropra","Zuthiwei","Xucroria","Ungarvis","Duarilia","Giter","Brovurilia","Muemia","Dolla T9","Phyke 88","Chunuetune","Kuluter","Bostrorth","Thondion","Ieter","Momia","Covurus","Layulara","Sypso 3VJD","Garvis 1ZX","Pigonus","Tenreuria","Yabbosie","Thicherth","Aelea","Thotov","Triraliv","Zachuliv","Brion KRS4","Thypso 9DG3","Hunruter","Chathiuruta","Kucippe","Sunzade","Sestea","Tethea","Bilalea","Llasolia","Colla 71Q","Churn TC","Xecratera","Pelnutov","Tebbars","Echion","Chehiri","Thiria","Simitera","Cretigawa","Drore PH1","Crora IRF","Xillounope","Thiphiuria","Kedreron","Megrorth","Xiotis","Pilara","Gnaalara","Lizanope","Byria R","Brilia 62K","Visunope","Podioria","Kanrilia","Chungeron","Cheatune","Eunus","Lloronides","Morania","Sonoe 70N","Nyke T59","Civuetis","Mibruzuno","Nagomia","Egrara","Atune","Leclite","Criitera","Lochuwei","Lerth YEH","Grara RJ4","Eviastea","Xagaustea","Zedriuq","Olmagua","Tivis","Chuzuno","Nosogantu","Diehines","Moria 8A","Zore 0277","Enduliv","Tennietov","Yalmilles","Echadus","Veawei","Zowei","Gnodoturn","Truparilia","Gragua C7","Chora 52N","Guziclite","Yonzarilia","Kasinda","Ruthyke","Laenope","Birus","Phetuhines","Milovis","Bides 9T3B","Grarth 80W","Tonoumia","Bundeonerth","Tondade","Punnapus","Xephus","Uanus","Crudupra","Briecury","Beon G2","Binda UZ0", "Rephecarro", "Sophebos", "Lulmaonerth", "Zastruelea", "Ocroalea", "Gisadus", "Pandomia", "Duthilles", "Xechinda", "Kealia", "Luilia", "Buicarro", "Drekatania", "Cruutis", "Ciea 8F6E", "Noth WC3T", "Drorth 2I", "Treron M1V9", "Theshan LIXD", "Crora C809", "Theon 592", "Mides A61T", "Wei's Planet", "Mayan 889", "Fryer P123", "Rossen B227"];

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

		if (seed < 100/100) {
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
	   		return new Planet(randPos.x, randPos.y, 5000000, 75, "Black Hole", "Black Hole", "#ffffff", "black");
		} else if (seed = "kanus minimus") {
			// Create planets
	    	return new Planet(randPos.x, randPos.y, 1000, randRadius, "Planet", "Kanus Minimus", "#ffffff");
		}	
	}
}