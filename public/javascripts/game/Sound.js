/*

Manages the sound aspect of the game

*/
import {game} from "./Game.js";

export default class Sound {
	constructor() {

		// Beat detection
		this.beatDetection = false;
		this.segments = [];
		this.beatOpacity = 0.7;
		this.beat = 0;

		// Load music
		this.wavesurfer = WaveSurfer.create({
		    container: '#waveform',
		    waveColor: 'violet',
		    progressColor: 'purple'
		});

		// Setup the music
		this.setup();

	}

	setup() {

		// Define wavesurfer
		let {wavesurfer, segments} = this;

		// Load music
		wavesurfer.load('./sounds/music.mp3');

		// On music loaded
		wavesurfer.on('ready', function () {
			//wavesurfer.play();
			// Export beat segments
			let musicExport = wavesurfer.exportPCM(2048, 10000, true, 0);
		    Promise.resolve(musicExport).then(function(value) {
				game.sound.segments = JSON.parse(value);
			});
		});

		// Restart music when finished
		wavesurfer.on('finish', function () {
    		wavesurfer.play();
		});
	}

	music() {

		if (this.segments.length == 0 || !this.beatDetection)
			return;

		// Define wavesurfer and beat samples
		var {wavesurfer} = this;
		let downbeat = this.segments[Math.round(2048 * wavesurfer.backend.getPlayedPercents())*2];
		let threshold = 0.2;

		// Beat detection
		if(downbeat > this.beat + threshold) {
			this.beatOpacity = 1;
		}

		// Update previous beat
		this.beat = downbeat;

		// Resolve beat opacity
		if(this.beatOpacity > 0.2) {
			this.beatOpacity -= 0.0007 * delta
		}
	}
}