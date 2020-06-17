import Vector from "../util/Vector.js";
import {camera} from '../visuals/Camera.js';

class Util {
	constructor() {
		this.now = true;
	}

	getRandomRgb() {
		var num = Math.round(0xffffff * Math.random());
		var r = num >> 16;
		var g = num >> 8 & 255;
		var b = num & 255;
		return 'rgb(' + r + ', ' + g + ', ' + b + ')';
	}

	getRandomHEX() {
		var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
		return randomColor;
	}
	// Create an RGB value from a hex value
	hexToRgb(hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}

	// Create an hex value from a RGB value
	rgbToHex(rgb) { 
	  var hex = Number(rgb).toString(16);
	  if (hex.length < 2) {
	       hex = "0" + hex;
	  }
	  return hex;
	};

	// Random ID

	randomString(length) {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');

	    if (! length) {
	        length = Math.floor(Math.random() * chars.length);
	    }

	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * chars.length)];
	    }
	    return str;
	}

	// Math functions
	constrain(value, a, b) {
		if (value < a) {
			return a;
		} else if (value > b) {
			return b;
		} else {
			return value;
		}
	}

	random(min, max) {
		return Math.random() * (max - min) + min;
	}

	randInt(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	}

	getRandomInt(max) {
	  return Math.floor(Math.random() * Math.floor(max));
	}

	// Return a random vector that is uniformly distributed within a circle given a radius
	randCircle(radius) { 
		var r = radius * Math.sqrt(Math.random());
		var theta = Math.random() * 2 * Math.PI;

		return new Vector(r * Math.cos(theta), r * Math.sin(theta));
	}

	randomProperty(obj) {
	    var keys = Object.keys(obj)
	    return obj[keys[ keys.length * Math.random() << 0]];
	}

	randn_bm() {
	    var u = 0, v = 0;
	    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	    while(v === 0) v = Math.random();
	    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
	    num = num / 10.0 + 0.5; // Translate to 0 -> 1
	    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
	    return num;
	}

	randomG(v){ 
	    var r = 0;
	    for(var i = v; i > 0; i --){
	        r += Math.random();
	    }
	    return r / v;
	}

	interpolate(a, b, frac) // points A and B, frac between 0 and 1
	{
	    var nx = a.x+(b.x-a.x)*frac;
	    var ny = a.y+(b.y-a.y)*frac;
	    return new Vector(nx, ny);
	}

	dist(a, b) {
		return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
	}

	planetDist(rocket, planet) {
		return dist(rocket.pos, planet.pos) - rocket.height/2 - planet.radius;
	}

	round(value, decimalPlace) {
		var decimalPlace = (decimalPlace === undefined) ? 0 : decimalPlace;
		return Math.round( value * (10 ** decimalPlace)) / (10 ** decimalPlace)
	}

	getRandomColor() {
	  var letters = '0123456789ABCDEF';
	  var color = '#';
	  for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}

	// Collision detection helper
	circleCollidesRect(circle, rect) {
		
		var rectCenterX = rect.pos.x;
		var rectCenterY = rect.pos.y;

		var rectX = rectCenterX - rect.width / 2;
		var rectY = rectCenterY - rect.height / 2;

		var rectReferenceX = rectX;
		var rectReferenceY = rectY;
		
		// Rotate circle's center point back
		var unrotatedCircleX = Math.cos( rect.angle ) * ( circle.pos.x - rectCenterX ) - Math.sin( rect.angle ) * ( circle.pos.y - rectCenterY ) + rectCenterX;
		var unrotatedCircleY = Math.sin( rect.angle ) * ( circle.pos.x - rectCenterX ) + Math.cos( rect.angle ) * ( circle.pos.y - rectCenterY ) + rectCenterY;

		// Closest point in the rectangle to the center of circle rotated backwards(unrotated)
		var closestX, closestY;

		// Find the unrotated closest x point from center of unrotated circle
		if ( unrotatedCircleX < rectReferenceX ) {
			closestX = rectReferenceX;
		} else if ( unrotatedCircleX > rectReferenceX + rect.width ) {
			closestX = rectReferenceX + rect.width;
		} else {
			closestX = unrotatedCircleX;
		}
	 
		// Find the unrotated closest y point from center of unrotated circle
		if ( unrotatedCircleY < rectReferenceY ) {
			closestY = rectReferenceY;
		} else if ( unrotatedCircleY > rectReferenceY + rect.height ) {
			closestY = rectReferenceY + rect.height;
		} else {
			closestY = unrotatedCircleY;
		}
	 
		// Determine collision
		var collision = false;
		var distance = this.getDistance( unrotatedCircleX, unrotatedCircleY, closestX, closestY );
		 
		if ( distance < circle.radius ) {
			collision = true;
		}
		else {
			collision = false;
		}

		return collision;
	}

	getDistance( fromX, fromY, toX, toY ) {
	    let diffX, diffY;
	    if (fromX instanceof Vector || fromX.x) {
	        diffX = Math.abs( fromX.x - fromY.x );
	        diffY = Math.abs( fromX.y - fromY.y );
	    } else {
	        diffX = Math.abs( fromX - toX );
	        diffY = Math.abs( fromY - toY );
	    }
		

		return Math.sqrt( ( diffX * diffX ) + ( diffY * diffY ) );
	}

	abbreviateNumber(value) {
	    var newValue = value;
	    if (value >= 1000) {
	        var suffixes = ["", "k", "m", "b","t"];
	        var suffixNum = Math.floor( (""+value).length/3 );
	        var shortValue = '';
	        for (var precision = 2; precision >= 1; precision--) {
	            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
	            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
	            if (dotLessShortValue.length <= 2) { break; }
	        }
	        if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
	        newValue = shortValue+suffixes[suffixNum];
	    }
	    return newValue;
	}

	scale(num, in_min, in_max, out_min, out_max) {
	  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	}

	onArc(center, object, radius) {
	    return new Vector(center.x + (radius * ((object.x - center.x) / (Math.sqrt(Math.pow(object.x - center.x, 2) + (Math.pow(object.y - center.y, 2)))))), 
	                    center.y + (radius * ((object.y - center.y) / (Math.sqrt(Math.pow(object.x - center.x, 2) + (Math.pow(object.y - center.y, 2)))))))
	}

	inRadialView(center, object, rocket, radius) {
	        object.x -= center.x;
	        object.y -= center.y;
	        rocket.x -= center.x;
	        rocket.y -= center.y;
	        let a = Math.pow((rocket.x - object.x), 2) + Math.pow((rocket.y - object.y), 2);
	        let b = 2*(object.x*(rocket.x - object.x) + object.y*(rocket.y - object.y));
	        let c = Math.pow(object.x, 2) + Math.pow(object.y, 2) - Math.pow(radius, 2);
	        let disc = Math.pow(b,2) - 4*a*c;
	        if(disc <= 0) 
	            return false;
	        let sqrtdisc = Math.sqrt(disc);
	        let t1 = (-b + sqrtdisc)/(2*a);
	        let t2 = (-b - sqrtdisc)/(2*a);
	        if((0 < t1 && t1 < 1) || (0 < t2 && t2 < 1)) 
	            return true;
	        return false;
	}

	inScreen(pos, relative, r, rocketPos) {
		var relative = relative || 1;
		var pos = Vector.mult(pos, camera.zoom);
		let radius = (r || 0) * camera.zoom;
		var rocketPos = Vector.mult(rocketPos, camera.zoom / relative);

		return pos.x > rocketPos.x - canvas.width/2 - radius && pos.x < rocketPos.x + canvas.width/2 + radius && pos.y > rocketPos.y - canvas.height/2 - radius && pos.y < rocketPos.y + canvas.height/2 + radius;
	}

	// Get screen pos
	getScreenPos(world, zoom, camera) {
		return new Vector(
			world.x*zoom - camera.x*zoom + canvas.width/2, 
			world.y*zoom - camera.y*zoom + canvas.height/2);
	}

	shadeColor(color, percent) {
	    var R = parseInt(color.substring(1,3),16);
	    var G = parseInt(color.substring(3,5),16);
	    var B = parseInt(color.substring(5,7),16);
	    R = parseInt(R * (100 + percent) / 100);
	    G = parseInt(G * (100 + percent) / 100);
	    B = parseInt(B * (100 + percent) / 100);
	    R = (R<255)?R:255;  
	    G = (G<255)?G:255;  
	    B = (B<255)?B:255;  
	    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
	    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
	    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    	return "#"+RR+GG+BB;
	}


	// Cookie functions for storing and getting data
	setCookie(cname,cvalue,exdays) {
	    var d = new Date(); 
	    d.setTime(d.getTime() + (exdays*1000*60*60*24));
	    var expires = "expires=" + d.toGMTString(); 
	    window.document.cookie = cname+"="+cvalue+"; "+expires;
	}

	getCookie(cname) {
	    var name = cname + "=";
	    var cArr = window.document.cookie.split(';');
	    for(var i=0; i<cArr.length; i++) {
	        var c = cArr[i].trim();
	        if (c.indexOf(name) == 0) 
	            return c.substring(name.length, c.length);
	    }
	    return "";
	}

	deleteCookie(cname) {
	    var d = new Date();
	    d.setTime(d.getTime() - (1000*60*60*24));
	    var expires = "expires=" + d.toGMTString();
	    window.document.cookie = cname+"="+"; "+expires;
	}

	checkCookie() {
	    var vistor=getCookie("vistorname");
	    if (vistor != "") {
	        var welcome_msg = window.document.getElementById('welcome-msg');
	        welcome_msg.innerHTML="Welcome "+vistor;
	    } else {
	       vistor = prompt("What is your name?","");
	       if (vistor != "" && vistor != null) {
	           setCookie("vistorname", vistor, 30);
	       }
	    }
	}

	updateCookie(cname, cvalue) {

	    if(getCookie(cname) == "") {
	        console.log('Created cookie with value: ' + JSON.stringify(cvalue))
	        let exdays = 365;
	        setCookie(cname,cvalue,exdays);
	    }
	    if(JSON.stringify(cvalue) != getCookie(cname)) {
	        deleteCookie(cname);
	        let exdays = 365;
	        setCookie(cname,cvalue,exdays);
	    }
	}

	dragElement(elmnt) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		if (document.getElementById(elmnt.id + "header")) {
		// if present, the header is where you move the DIV from:
			document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
		} else {
		// otherwise, move the DIV from anywhere inside the DIV:
			elmnt.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
		    e = e || window.event;
		    e.preventDefault();
		    // calculate the new cursor position:
		    pos1 = pos3 - e.clientX;
		    pos2 = pos4 - e.clientY;
		    pos3 = e.clientX;
		    pos4 = e.clientY;
		    // set the element's new position:
		    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
		    // stop moving when mouse button is released:
		    document.onmouseup = null;
		    document.onmousemove = null;
		}
	}
}



export let util = new Util();