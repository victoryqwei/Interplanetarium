class Resource {
	constructor(type, amount, totalAmount) {
		if(type == undefined) {
			this.type = resourceTypes[randInt(0, resourceTypes.length-1)];
		} else {
			this.type = type;
		}
		this.amount = amount || randInt(100, 1000);
		if (type == "None")
			this.amount = 100;
		this.totalAmount = totalAmount || this.amount;
	}
}