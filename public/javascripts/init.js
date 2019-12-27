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
	legacyPlanetMarker: true,
	performanceMode: false,
	toggleMenu: true,
	toggleHUD: false,
	toggleInterface: false,
	spectate: true,
	triggerSpectate: false,
	advanced: false,
	options: false,
	interfaceScale: 1,
	zoom: 0.5,
	smoothZoom: [],
	smooth: false,
	minZoom: 0.8,
	maxZoom: 2.5,
	viewPadding: 30,
	textSpacing: 12,
	HUDwidth: 400,
	HUDheight: 190,
	play: 1
}

// Setup options
var interfaceSlider = document.getElementById("interfaceScale");
interfaceSlider.value = getCookie("userScale")*50 || display.interfaceScale * 50;


let rocket, planets, stars;
planets = stars = [];

let stats;

// Create smoke image
var smoke = new Image();
smoke.src = "images/smoke.png";

var base_level1 = new Image();
base_level1.src = "images/base_level1.svg";
var base_level2 = new Image();
base_level2.src = "images/base_level2.svg";
var base_level3 = new Image();
base_level3.src = "images/base_level3.svg";

// Gather cookie data
if(getCookie("userMarker") == "true") {
	display.legacyPlanetMarker = true;
	document.getElementById("planetMarker").checked = true;
	//console.log("true")
} else {
	display.legacyPlanetMarker = false;
	document.getElementById("planetMarker").checked = false;
	//console.log("false: " + getCookie("userMarker"));
}
if(getCookie("userPerformance") == "true") {
	display.performanceMode = true;
	document.getElementById("performance").checked = true;
} else {
	display.performanceMode = false;
	document.getElementById("performance").checked = false;
}

// Names
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
    stats.push(new Stats("Rocket Integrity", rocket, "integrity"));
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

$("#begin").click(function () {
	var title = document.getElementById("title");
	title.style.display = 'none'
	spawnPlayer();
})

$("#spec").click(function () {
	var title = document.getElementById("title");
	title.style.display = 'none'
	display.play = 2;
})


function spawnPlayer() {

	cookieGetter();

	let rocketData = {

		socketId: socket.id,
		serverId: server.id,
		name: $("#name").val() || "Player",
		color: document.getElementById("color").value
	}

	socket.emit('joinServer', rocketData);
	display.play = 0;
	rocket.respawn();
	display.spectate = false;
	rocket.color = document.getElementById("color").value;
}

function cookieGetter() {

	//Color cookie
	let hexColor = $("#color").val();
	if(getCookie('userColor') == "") {
		console.log('Created color cookie with value: ' + JSON.stringify(hexColor))
		cname = 'userColor';
		cvalue = JSON.stringify(hexColor);
		exdays = 365;
		setCookie(cname,cvalue,exdays);
	}
	console.log(JSON.stringify(hexColor) + ' / ' + getCookie('userColor'));
	if(JSON.stringify(hexColor) != getCookie('userColor')) {
		console.log('Deleted color cookie with value: ' + getCookie('userColor'));
		deleteCookie('userColor');
		console.log('Created color cookie with value: ' + JSON.stringify(hexColor));
		cname = 'userColor';
		cvalue = JSON.stringify(hexColor);
		exdays = 365;
		setCookie(cname,cvalue,exdays);
	}

	//Name cookie
	let userName = $("#name").val();
	let letterNumber = /^[0-9a-zA-Z]+$/;
	if(($("#name").val()).match(letterNumber)) {
	 	if(getCookie('userName') == "") {
			console.log('Created name cookie with value: ' + JSON.stringify(userName))
			cname = 'userName';
			cvalue = JSON.stringify(userName);
			exdays = 365;
			setCookie(cname,cvalue,exdays);
		}
		console.log(JSON.stringify(userName) + ' / ' + getCookie('userName'));
		if(JSON.stringify($("#name").val()) != getCookie('userName')) {
			console.log('Deleated name cookie with value: ' + getCookie('userName'));
			deleteCookie('userName');
			console.log('Created name cookie with value: ' + JSON.stringify(userName));
			cname = 'userName';
			cvalue = JSON.stringify(userName);
			exdays = 365;
			setCookie(cname,cvalue,exdays);
		}
	} else {
	   //alert("Please only use alphanumeric characters without spaces!"); 
	}
}