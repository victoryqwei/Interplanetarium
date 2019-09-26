var Function = require('./Function.js');
var Planet = require('./Planet.js');
var Vector = require('./Vector.js');

var planetNames = ["Onvoacury","Tephoatov","Thucurn","Yethiri","Seutera","Zeanope","Ziceter","Phipehines","Lladus XF","Cagua JBR","Xankehines","Zelnionerth","Polvore","Xunvichi","Azuno","Buinus","Diizuno","Llachogawa","Phorth OG1","Liuq EXB","Illoustea","Xellenides","Minkore","Melvagua","Miphus","Dotania","Seluruta","Bavalea","Groria FPVC","Soria 0OG","Xethiebos","Posaiyama","Nocrinda","Thaphade","Sigawa","Uiwei","Crukiruta","Sevuturn","Gruna 4L1","Goth M","Tegneivis","Ronkeostea","Mallarvis","Allypso","Theturn","Yielia","Thexazuno","Golunides","Zapus 2E3","Crara 2L","Chinkutune","Olnilea","Vozone","Lonroth","Baohiri","Vivis","Gnochoruta","Griezuno","Chade 7FD5","Bradus 2","Dinionope","Sinazuno","Gotrion","Idiea","Beutune","Lieter","Phaezuno","Brakuter","Chonoe 6010","Stroria 76","Zonkorilia","Zignaimia","Nebyke","Chenvade","Dealara","Puturn","Striaturn","Brepolea","Gillon 2BX","Cara 4L3","Chudiugawa","Cholelia","Gozinda","Xaleon","Zionides","Diewei","Lluniliv","Muoturn","Streon 4TV","Crara N08","Xugreter","Tubiegawa","Xudars","Gozars","Zaophus","Yuliv","Gechucarro","Dokecury","Geron VQ2","Cippe 7EWH","Aveclite","Yiphaimia","Alloth","Odade","Aitov","Alia","Crumonope","Phoustea","Phion WFW","Strion 2F0Q","Rethuiter","Thusaruta","Mucrinda","Adyria","Lonia","Havis","Drapiwei","Ciohiri","Llilia 3HVW","Gore PI","Chustretania","Nubbicarro","Guvillon","Yennoth","Xunides","Paophus","Broetis","Saroter","Brora 371","Sorix MHO","Zidropra","Zuthiwei","Xucroria","Ungarvis","Duarilia","Giter","Brovurilia","Muemia","Dolla T9","Phyke 88","Chunuetune","Kuluter","Bostrorth","Thondion","Ieter","Momia","Covurus","Layulara","Sypso 3VJD","Garvis 1ZX","Pigonus","Tenreuria","Yabbosie","Thicherth","Aelea","Thotov","Triraliv","Zachuliv","Brion KRS4","Thypso 9DG3","Hunruter","Chathiuruta","Kucippe","Sunzade","Sestea","Tethea","Bilalea","Llasolia","Colla 71Q","Churn TC","Xecratera","Pelnutov","Tebbars","Echion","Chehiri","Thiria","Simitera","Cretigawa","Drore PH1","Crora IRF","Xillounope","Thiphiuria","Kedreron","Megrorth","Xiotis","Pilara","Gnaalara","Lizanope","Byria R","Brilia 62K","Visunope","Podioria","Kanrilia","Chungeron","Cheatune","Eunus","Lloronides","Morania","Sonoe 70N","Nyke T59","Civuetis","Mibruzuno","Nagomia","Egrara","Atune","Leclite","Criitera","Lochuwei","Lerth YEH","Grara RJ4","Eviastea","Xagaustea","Zedriuq","Olmagua","Tivis","Chuzuno","Nosogantu","Diehines","Moria 8A","Zore 0277","Enduliv","Tennietov","Yalmilles","Echadus","Veawei","Zowei","Gnodoturn","Truparilia","Gragua C7","Chora 52N","Guziclite","Yonzarilia","Kasinda","Ruthyke","Laenope","Birus","Phetuhines","Milovis","Bides 9T3B","Grarth 80W","Tonoumia","Bundeonerth","Tondade","Punnapus","Xephus","Uanus","Crudupra","Briecury","Beon G2","Binda UZ0", "Rephecarro", "Sophebos", "Lulmaonerth", "Zastruelea", "Ocroalea", "Gisadus", "Pandomia", "Duthilles", "Xechinda", "Kealia", "Luilia", "Buicarro", "Drekatania", "Cruutis", "Ciea 8F6E", "Noth WC3T", "Drorth 2I", "Treron M1V9", "Theshan LIXD", "Crora C809", "Theon 592", "Mides A61T", "Wei's Planet", "Mayan 889", "Fryer P123", "Rossen B227"];

let earthRadius = 200;
let massMultiplier = 1000; // How much the planet mass is multiplied by its radius
let minSpawnDistance = 200; // How much the planets must be separated by

module.exports = class Map {
	constructor() {

		this.planetNumber = 100;
		this.size = 20000;
		this.planets = [];

		this.generateMap(this.planetNumber, this.size)
	}

	generateMap(numberOfPlanets, size) {
		// Initiate 
		this.planets = [new Planet(0, earthRadius, earthRadius * massMultiplier, earthRadius, "Planet", "Earth", "#0d7d93", "green")];

		for (let i = 0; i < numberOfPlanets; i++) {
			this.planets.push(this.generatePlanet(size));
		}
	}

	generatePlanet(size) {
		// Determine the type of planet (planet, blackhole, asteroid)
		let seed = Math.random();
		let randRadius;
		if (seed < 90/100) {
			seed = "planet";
			randRadius = Function.randInt(100, 300);
		} else if (seed < 98/100) {
			seed = "blackhole";
			randRadius = 75;
		} else {
			seed = "kanus maximus";
			randRadius = 1000;
		}
	   
	   	// Randomly generate position until it meets the criteria
	   	let randX, randY
	   	let generated = false;
	   	while (!generated) {
	   		// Creating new planets	 
	    	randX = Function.randInt(-size, size);
	    	randY = Function.randInt(-size, size);

	    	let validPosition = true;

	    	// Check for valid spawning location
	    	for (let p of this.planets) {
				if (Function.dist(new Vector(randX, randY), p.pos) < p.radius + randRadius + minSpawnDistance) {
					validPosition = false;
				}
			}

			if (validPosition)
				generated = true;
	   	}
	    	

		// Randomly create planets / black holes based on seed
		if(seed == "planet") {
	    	// Create planets
	    	return new Planet(randX, randY, randRadius * massMultiplier, randRadius, "Planet", planetNames[Function.randInt(0, planetNames.length-1)], Function.getRandomColor())

		} else if (seed == "blackhole") {
			// Create black hole
	   		return new Planet(randX, randY, 5000000, 75, "Black Hole", "Black Hole", "#000000", "black");
		} else if (seed = "kanus maximus") {
			// Create planets
	    	return new Planet(randX, randY, 10000000, randRadius, "Planet", "Kanus Maximus", Function.getRandomColor());
		}	
	}
}