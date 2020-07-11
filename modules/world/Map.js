/*

Creates the map for the room with planets and alien structures

*/

var Vector = require('../util/Vector.js');
var Util = require('../util/Util.js');
var {QuadTree, Rectangle, Point, Circle} = require('../util/QuadTree.js');
var Planet = require('./Planet.js');
var Turret = require('./Turret.js')
var Base = require('./Base.js')
var planetNames = ["Onvoacury","Tephoatov","Thucurn","Yethiri","Seutera","Zeanope","Ziceter","Phipehines","Lladus XF","Cagua JBR","Xankehines","Zelnionerth","Polvore","Xunvichi","Azuno","Buinus","Diizuno","Llachogawa","Phorth OG1","Liuq EXB","Illoustea","Xellenides","Minkore","Melvagua","Miphus","Dotania","Seluruta","Bavalea","Groria FPVC","Soria 0OG","Xethiebos","Posaiyama","Nocrinda","Thaphade","Sigawa","Uiwei","Crukiruta","Sevuturn","Gruna 4L1","Goth M","Tegneivis","Ronkeostea","Mallarvis","Allypso","Theturn","Yielia","Thexazuno","Golunides","Zapus 2E3","Crara 2L","Chinkutune","Olnilea","Vozone","Lonroth","Baohiri","Vivis","Gnochoruta","Griezuno","Chade 7FD5","Bradus 2","Dinionope","Sinazuno","Gotrion","Idiea","Beutune","Lieter","Phaezuno","Brakuter","Chonoe 6010","Stroria 76","Zonkorilia","Zignaimia","Nebyke","Chenvade","Dealara","Puturn","Striaturn","Brepolea","Gillon 2BX","Cara 4L3","Chudiugawa","Cholelia","Gozinda","Xaleon","Zionides","Diewei","Lluniliv","Muoturn","Streon 4TV","Crara N08","Xugreter","Tubiegawa","Xudars","Gozars","Zaophus","Yuliv","Gechucarro","Dokecury","Geron VQ2","Cippe 7EWH","Aveclite","Yiphaimia","Alloth","Odade","Aitov","Alia","Crumonope","Phoustea","Phion WFW","Strion 2F0Q","Rethuiter","Thusaruta","Mucrinda","Adyria","Lonia","Havis","Drapiwei","Ciohiri","Llilia 3HVW","Gore PI","Chustretania","Nubbicarro","Guvillon","Yennoth","Xunides","Paophus","Broetis","Saroter","Brora 371","Sorix MHO","Zidropra","Zuthiwei","Xucroria","Ungarvis","Duarilia","Giter","Brovurilia","Muemia","Dolla T9","Phyke 88","Chunuetune","Kuluter","Bostrorth","Thondion","Ieter","Momia","Covurus","Layulara","Sypso 3VJD","Garvis 1ZX","Pigonus","Tenreuria","Yabbosie","Thicherth","Aelea","Thotov","Triraliv","Zachuliv","Brion KRS4","Thypso 9DG3","Hunruter","Chathiuruta","Kucippe","Sunzade","Sestea","Tethea","Bilalea","Llasolia","Colla 71Q","Churn TC","Xecratera","Pelnutov","Tebbars","Echion","Chehiri","Thiria","Simitera","Cretigawa","Drore PH1","Crora IRF","Xillounope","Thiphiuria","Kedreron","Megrorth","Xiotis","Pilara","Gnaalara","Lizanope","Byria R","Brilia 62K","Visunope","Podioria","Kanrilia","Chungeron","Cheatune","Eunus","Lloronides","Morania","Sonoe 70N","Nyke T59","Civuetis","Mibruzuno","Nagomia","Egrara","Atune","Leclite","Criitera","Lochuwei","Lerth YEH","Grara RJ4","Eviastea","Xagaustea","Zedriuq","Olmagua","Tivis","Chuzuno","Nosogantu","Diehines","Moria 8A","Zore 0277","Enduliv","Tennietov","Yalmilles","Echadus","Veawei","Zowei","Gnodoturn","Truparilia","Gragua C7","Chora 52N","Guziclite","Yonzarilia","Kasinda","Ruthyke","Laenope","Birus","Phetuhines","Milovis","Bides 9T3B","Grarth 80W","Tonoumia","Bundeonerth","Tondade","Punnapus","Xephus","Uanus","Crudupra","Briecury","Beon G2","Binda UZ0", "Rephecarro", "Sophebos", "Lulmaonerth", "Zastruelea", "Ocroalea", "Gisadus", "Pandomia", "Duthilles", "Xechinda", "Kealia", "Luilia", "Buicarro", "Drekatania", "Cruutis", "Ciea 8F6E", "Noth WC3T", "Drorth 2I", "Treron M1V9", "Theshan LIXD", "Crora C809", "Theon 592", "Mides A61T", "Wei's Planet", "Mayan 889", "Fryer P123", "Rossen B227"];

module.exports = class Map {
	constructor(stageNumber, mapSize) {
		this.stage = stageNumber;
		this.planetNumber = stageNumber*10+10 || 200;
		this.mapRadius = ((stageNumber+1)*500 + 3000) || 10000;

		// Planets
		this.planets = {};
		this.qtree = new QuadTree(new Rectangle(0, 0, this.mapRadius, this.mapRadius), 100);

		// Missile
		this.newMissiles = [];
		this.missiles = [];

		// Visual effects
		this.newEffects = [];

		// Experience
		this.newXP = [];

		// Generate map
		this.generateMap(this.planetNumber, this.mapRadius-500);
	}

	update(players) {
		for (let id in this.planets) {
			this.planets[id].update(players, this.newMissiles);
		}

		this.updateMissiles();
		this.updateMap();
	}

	updateQuadTree() {
		this.qtree = new QuadTree(new Rectangle(0, 0, this.mapRadius, this.mapRadius), 100);

		for (let id in this.planets) {
			let p = this.planets[id];

			for (let id in p.turrets) {
				let t = p.turrets[id];
				var point = new Point(t.pos.x, t.pos.y, t.radius, p.turrets[id]);
				this.qtree.insert(point);
			}

			for (let id in p.bases) {
				let t = p.bases[id];
				var point = new Point(t.pos.x, t.pos.y, t.radius, p.bases[id]);
				this.qtree.insert(point);
			}

			var point = new Point(p.pos.x, p.pos.y, p.radius, this.planets[id]);
			this.qtree.insert(point);
		}
	}

	updateMap() {

		// Randomly delete planets with no turrets or bases
		for (let id in this.planets) {
    		let p = this.planets[id];
    		if(Object.keys(p.turrets).length < 1 && Object.keys(p.bases).length < 1 && p.type == "planet") {
    			if (Math.random() > 0) {
	    			// Push death effect
					this.newEffects.push({
						pos: this.planets[id].pos,
						type: "implosion", 
						options: {size: this.planets[id].radius, alpha: 1, duration: 1000, color: this.planets[id].color}
					})

					// Delete planet
					delete this.planets[id];
		    		this.updateQuadTree();

		    		// Create new planet
		    		let planetId = Util.randomString(8);
					let planet = this.generatePlanet(this.mapRadius, planetId);
					if (planet)
						this.planets[planetId] = planet;

    			}
    		}
    	}	
    	// Create new planets if there is too few
    	if(Object.keys(this.planets).length < this.planetNumber) {
    		// Create new planet
    		let planetId = Util.randomString(8);
			let planet = this.generatePlanet(this.mapRadius, planetId);
			if (planet)
				this.planets[planetId] = planet;
    	}
	}

	updateMissiles() {
		for (let i = this.missiles.length-1; i >= 0; i--) {
			let m = this.missiles[i];			

			let collision = false;

			// Get the current position of the missile
			let t = Date.now()-m.time;
			let pos = new Vector(m.pos.x, m.pos.y);
			let deltaPos = Vector.mult(m.heading, t);
			deltaPos.mult(m.speed);
			pos.add(deltaPos);
			pos.add(Vector.mult(m.vel, t/1000));

			// Query the map for collision
			let range = new Circle(pos.x, pos.y, 350);
			let points = this.qtree.query(range);

			for (let p of points) {
				if (!this.planets[p.data.id])
					continue;
				
				if (p.data instanceof Turret) {
					let distance = Util.getDistance(p.data.pos, pos);


					let turret = this.planets[p.data.id].turrets[p.data.turretId];
					if (turret && distance < turret.radius) {
						collision = true;
						turret.health -= m.damage;
						this.newEffects.push({
							pos: pos,
							type: "damage", 
							options: {size: 20, alpha: 1, duration: 1000, text: -m.damage, color: "red"}
						})

						if (turret.health <= 0) {
							this.newXP.push({
								id: m.id,
								xp: 20
							})
							delete this.planets[p.data.id].turrets[p.data.turretId];
						}
					}
				} else if (p.data instanceof Base) {
					let distance = Util.getDistance(p.data.pos, pos);

					let base = this.planets[p.data.id].bases[p.data.baseId];
					if (base && distance < base.radius) {
						collision = true;
						base.health -= m.damage;
						this.newEffects.push({
							pos: pos,
							type: "damage", 
							options: {size: 20, alpha: 1, duration: 1000, text: -m.damage, color: "red"}
						})

						if (base.health <= 0) {
							this.newXP.push({
								id: m.id,
								xp: base.level * 50
							})
							delete this.planets[p.data.id].bases[p.data.baseId];
						}
					}
				} else if (p.data instanceof Planet) {
					let distance = Util.getDistance(p.data.pos, pos);

					if (distance < p.data.radius)
						collision = true;
				}
			}

			let old = Date.now() - m.time > 1000;
			if (old || collision) {
				this.missiles.splice(i, 1);
			}
		}
	}

	generateMap(numberOfPlanets, radius) {

		// Generate planets
		for (let i = 0; i < numberOfPlanets; i++) {
			let planetId = Util.randomString(8);
			let planet = this.generatePlanet(radius, planetId);
			if (planet)
				this.planets[planetId] = planet;
		}
	}

	generatePlanet(radius, id) {

		// Radius in which the planets can spawn
		let location = Util.randCircle(radius - 300);

		// Spawn planet
		let planet = {
			name: planetNames[Util.randInt(0, planetNames.length-1)],
			color: Util.getRandomColor(),
			type: "planet",
			radius: Util.randInt(150, 300),
			mass: 100000,
			distance: 200
		}

		// Spawn blackholes
		if (Math.random() > 1 - this.stage/100) {
			planet.name = "Black Hole"
			planet.color = "#000000"
			planet.type = "blackhole";
			planet.radius = 75;
			planet.mass = 5000000;
			planet.distance = 1000;
		}

    	// Check for valid spawning location
    	for (let id in this.planets) {
    		let p = this.planets[id];
			if (Util.dist(new Vector(location.x, location.y), p.pos) < p.radius + planet.radius + planet.distance) {
				return;
			}
		}

		// Create planet
		let spawnedPlanet = new Planet(location.x, location.y, planet.mass, planet.radius, planet.type, planet.name, planet.color, id, this.stage)

		// Update quadtrees
		var point = new Point(location.x, location.y, planet.radius, spawnedPlanet);
		this.qtree.insert(point);

		// Update turrets
		for (let id in spawnedPlanet.turrets) {
			let t = spawnedPlanet.turrets[id];
			var point = new Point(t.pos.x, t.pos.y, 30, t);
			this.qtree.insert(point);
		}

		// Update planets
		for (let id in spawnedPlanet.bases) {
			let t = spawnedPlanet.bases[id];
			var point = new Point(t.pos.x, t.pos.y, 30, t);
			this.qtree.insert(point);
		}

		return spawnedPlanet;
	}
}