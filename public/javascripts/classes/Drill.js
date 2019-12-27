class Drill {
	constructor(level) {

		// Drill level
		this.level = level || 1;

		// Drill statistics
		this.miningSpeed = 1*level;
		this.drillAngle = 0;
	}
}