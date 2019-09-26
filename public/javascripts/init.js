// Initialize Socket.IO
var socket = io();

// Initialize images
var images = {
	wasd: new Image()
}

images.wasd.src = "wasd.png";

// Setup canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = $(document).innerWidth();
canvas.height = $(document).innerHeight();	

$(window).resize(function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

// Display settings
let display = {
	toggleMenu: true,
	toggleInterface: false,
	advanced: false,
	options: false,
	interfaceScale: 1,
	zoom: 1,
	smoothZoom: [],
	smooth: true,
	minZoom: 0.5,
	maxZoom: 2.5,
	viewPadding: 30,
	textSpacing: 12,
	HUDwidth: 400,
	HUDheight: 190
}

// Setup options
var interfaceSlider = document.getElementById("interfaceScale");
interfaceSlider.value = display.interfaceScale * 50;

// Map width
var map = {
	width: 20000,
	height: 20000
}

let rocket, planets, stars;
planets = stars = [];

let stats;

// Create smoke image
var smoke = new Image();
smoke.src = "https://www.blog.jonnycornwell.com/wp-content/uploads/2012/07/Smoke10.png";

var resourceTypes = ["Iron", "Copper", "Lead", "Kanium"];

var solarSystem = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

var planetNames = ["Onvoacury","Tephoatov","Thucurn","Yethiri","Seutera","Zeanope","Ziceter","Phipehines","Lladus XF","Cagua JBR","Xankehines","Zelnionerth","Polvore","Xunvichi","Azuno","Buinus","Diizuno","Llachogawa","Phorth OG1","Liuq EXB","Illoustea","Xellenides","Minkore","Melvagua","Miphus","Dotania","Seluruta","Bavalea","Groria FPVC","Soria 0OG","Xethiebos","Posaiyama","Nocrinda","Thaphade","Sigawa","Uiwei","Crukiruta","Sevuturn","Gruna 4L1","Goth M","Tegneivis","Ronkeostea","Mallarvis","Allypso","Theturn","Yielia","Thexazuno","Golunides","Zapus 2E3","Crara 2L","Chinkutune","Olnilea","Vozone","Lonroth","Baohiri","Vivis","Gnochoruta","Griezuno","Chade 7FD5","Bradus 2","Dinionope","Sinazuno","Gotrion","Idiea","Beutune","Lieter","Phaezuno","Brakuter","Chonoe 6010","Stroria 76","Zonkorilia","Zignaimia","Nebyke","Chenvade","Dealara","Puturn","Striaturn","Brepolea","Gillon 2BX","Cara 4L3","Chudiugawa","Cholelia","Gozinda","Xaleon","Zionides","Diewei","Lluniliv","Muoturn","Streon 4TV","Crara N08","Xugreter","Tubiegawa","Xudars","Gozars","Zaophus","Yuliv","Gechucarro","Dokecury","Geron VQ2","Cippe 7EWH","Aveclite","Yiphaimia","Alloth","Odade","Aitov","Alia","Crumonope","Phoustea","Phion WFW","Strion 2F0Q","Rethuiter","Thusaruta","Mucrinda","Adyria","Lonia","Havis","Drapiwei","Ciohiri","Llilia 3HVW","Gore PI","Chustretania","Nubbicarro","Guvillon","Yennoth","Xunides","Paophus","Broetis","Saroter","Brora 371","Sorix MHO","Zidropra","Zuthiwei","Xucroria","Ungarvis","Duarilia","Giter","Brovurilia","Muemia","Dolla T9","Phyke 88","Chunuetune","Kuluter","Bostrorth","Thondion","Ieter","Momia","Covurus","Layulara","Sypso 3VJD","Garvis 1ZX","Pigonus","Tenreuria","Yabbosie","Thicherth","Aelea","Thotov","Triraliv","Zachuliv","Brion KRS4","Thypso 9DG3","Hunruter","Chathiuruta","Kucippe","Sunzade","Sestea","Tethea","Bilalea","Llasolia","Colla 71Q","Churn TC","Xecratera","Pelnutov","Tebbars","Echion","Chehiri","Thiria","Simitera","Cretigawa","Drore PH1","Crora IRF","Xillounope","Thiphiuria","Kedreron","Megrorth","Xiotis","Pilara","Gnaalara","Lizanope","Byria R","Brilia 62K","Visunope","Podioria","Kanrilia","Chungeron","Cheatune","Eunus","Lloronides","Morania","Sonoe 70N","Nyke T59","Civuetis","Mibruzuno","Nagomia","Egrara","Atune","Leclite","Criitera","Lochuwei","Lerth YEH","Grara RJ4","Eviastea","Xagaustea","Zedriuq","Olmagua","Tivis","Chuzuno","Nosogantu","Diehines","Moria 8A","Zore 0277","Enduliv","Tennietov","Yalmilles","Echadus","Veawei","Zowei","Gnodoturn","Truparilia","Gragua C7","Chora 52N","Guziclite","Yonzarilia","Kasinda","Ruthyke","Laenope","Birus","Phetuhines","Milovis","Bides 9T3B","Grarth 80W","Tonoumia","Bundeonerth","Tondade","Punnapus","Xephus","Uanus","Crudupra","Briecury","Beon G2","Binda UZ0", "Rephecarro", "Sophebos", "Lulmaonerth", "Zastruelea", "Ocroalea", "Gisadus", "Pandomia", "Duthilles", "Xechinda", "Kealia", "Luilia", "Buicarro", "Drekatania", "Cruutis", "Ciea 8F6E", "Noth WC3T", "Drorth 2I", "Treron M1V9", "Theshan LIXD", "Crora C809", "Theon 592", "Mides A61T", "Wei's Planet", "Mayan 889", "Fryer P123", "Rossen B227"];

function addStats() {
	 // Add stats
    stats = [];
    stats.push(new Stats("FPS", fpsArray, false, 2))
    stats.push(new Stats("Position", rocket.pos))
    stats.push(new Stats("Velocity", rocket.vel))
    stats.push(new Stats("Speed", rocket, "speed"))
    stats.push(new Stats("Thrust", rocket, "thrust"))
    stats.push(new Stats("G-Force", rocket, "gForce", 2))
    stats.push(new Stats("Zoom", display, "zoom", 2));
    stats.push(new Stats("Angular Velocity", rocket, "angularVelocity", 2));
    stats.push(new Stats("Angle from Planet", rocket, "angleFromPlanet", 2));
}

// Functions
function updateZoom(rocket) {
	if (display.smooth) {
		//display.smoothZoom.unshift(1.5 - (Math.max(0, rocket.speed))/rocket.maxSpeed); // Speed based zoom
		display.smoothZoom.unshift(display.maxZoom - (rocket.closestPlanetDistance)/200); // Distance based zoom

		display.smoothZoom.length = 100; // Smoothness of zoom transition
		display.zoom = Math.max(display.minZoom, display.smoothZoom.reduce((a, b) => a + b, 0)/display.smoothZoom.length);
	}
}