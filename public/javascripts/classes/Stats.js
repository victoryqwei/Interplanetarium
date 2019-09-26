class Stats {
	constructor(name, value, key, round) {
		this.name = name;
		this.value = value;

		this.key = key;
		this.round = round;
	}

	display(index) {
		let text = this.name + ": ";

		if (this.key) {
			text += round(this.value[this.key], this.round);
		} else if (this.value instanceof Vector) {
			text += "x: " + round(this.value.x, this.round) + " y: " + round(this.value.y, this.round);
		} else if (this.value instanceof Array) {
			text += round(this.value.reduce((a, b) => a + b, 0)/this.value.length, this.round);
		}

		drawText(text, display.viewPadding, index*20+display.viewPadding, "20px Arial", "white", "left", "top");
	}
}