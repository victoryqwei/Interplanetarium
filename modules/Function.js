module.exports = class Function {

	static random(max, min) {
		return Math.random() * (max - min) + min;
	}

	static randInt(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	}

	static getRandomColor() {
	  	var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
		    color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	static dist(a, b) {
		return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
	}

	static randomString(length) {
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
}