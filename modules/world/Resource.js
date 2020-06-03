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
		this.amount = amount || Function.randInt(100, 1000);
		if (type == "None")
			this.amount = 100;
		this.totalAmount = totalAmount || this.amount;
	}
}