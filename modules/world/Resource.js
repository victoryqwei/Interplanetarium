var Vector = require('../util/Vector.js');
var Function = require('../util/Util.js');

var resourceTypes = ["Iron", "Copper", "Lead", "Kanium"];

module.exports = class Resource {
	constructor(type, amount, totalAmount) {
		if(type == undefined) {
			this.type = resourceTypes[Function.randInt(0, resourceTypes.length-1)];
		} else {
			this.type = type;
		}

		this.totalAmount = amount || Function.randInt(100, 1000);
		if (type == "None")
			this.totalAmount = 100;


		this.amount = Math.random() * this.totalAmount;

		
		
		
	}
}