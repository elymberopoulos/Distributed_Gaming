const jsnes = require('jsnes');
const fs = require('fs');
const Canvas = require('canvas');
//Require the emulator and FS for loading rom data from path.

/*
Initial thoughts: This code is designed to be embedded in a browser window.
We can embed it and take the numerical key codes from the switch statement below
and load them into an array. On connection to the web server a number from the
'command array' is passed back and assigned to a web page button. When a user clicks
that button then the eventlistener on the DOM element will trigger an emit through the socket
connection. the game should be running on the server with frames being emitted to each connected
user in a buffer array and the data being diplayed to a game window in a "frame" emit event.
*/

var SCREEN_WIDTH = 256;
var SCREEN_HEIGHT = 240;
var FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

var canvas_ctx, image;
var framebuffer_u8, framebuffer_u32;

var AUDIO_BUFFERING = 512;
var SAMPLE_COUNT = 4 * 1024;
var SAMPLE_MASK = SAMPLE_COUNT - 1;
var audio_samples_L = new Float32Array(SAMPLE_COUNT);
var audio_samples_R = new Float32Array(SAMPLE_COUNT);
var audio_write_cursor = 0, audio_read_cursor = 0;
var canvas = new Canvas.createCanvas(SCREEN_HEIGHT, SCREEN_WIDTH);



//Get the rom data into a binary
var rom_data = fs.readFileSync(__dirname + '/rom/Legend_of_Zelda.nes', { encoding: 'binary' });

function Emulator() {
	//INITIALIZE NEW NES OBJECT
	var nes = new jsnes.NES({
		onFrame: function (framebuffer_24) {
			for (var i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
		},
		onAudioSample: function (l, r) {
			audio_samples_L[audio_write_cursor] = l;
			audio_samples_R[audio_write_cursor] = r;
			audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK;
		},
	});
	return nes;
}

//LOAD ROM INTO EMULATOR
Emulator.prototype.nes_boot = function (rom_data) {
	nes.loadROM(rom_data);
	// window.requestAnimationFrame(onAnimationFrame);
}
//
Emulator.prototype.nes_load_data = function (canvas_id, rom_data) {
	nes_init(canvas_id);
	nes_boot(rom_data);
}

Emulator.prototype.onAnimationFrame = function () {
	// window.requestAnimationFrame(onAnimationFrame);
	// image.data.set(framebuffer_u8);
	// canvas_ctx.putImageData(image, 0, 0);
	// nes.frame();

	/* 
	Instead of setting the framebuffer to the image
	return it so it can be emitted over the broadcasting channels. 
	*/
	return canvas.toBuffer();
}


Emulator.prototype.nes_init = function (canvas_id) {
	// var canvas = document.getElementById(canvas_id);
	// canvas_ctx = canvas.getContext("2d");
	// image = canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	// canvas_ctx.fillStyle = "black";
	// canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	// Allocate framebuffer array.
	var buffer = new ArrayBuffer(image.data.length);
	framebuffer_u8 = new Uint8ClampedArray(buffer);
	framebuffer_u32 = new Uint32Array(buffer);

	// Setup audio.
	// var audio_ctx = new window.AudioContext();
	var script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
	script_processor.onaudioprocess = audio_callback;
	script_processor.connect(audio_ctx.destination);
}


Emulator.prototype.keyboard = function (callback, event) {
	var player = 1;
	switch (event.keyCode) {
		case 38: // UP
			callback(player, jsnes.Controller.BUTTON_UP); break;
		case 40: // Down
			callback(player, jsnes.Controller.BUTTON_DOWN); break;
		case 37: // Left
			callback(player, jsnes.Controller.BUTTON_LEFT); break;
		case 39: // Right
			callback(player, jsnes.Controller.BUTTON_RIGHT); break;
		case 65: // 'a' - qwerty, dvorak
		case 81: // 'q' - azerty
			callback(player, jsnes.Controller.BUTTON_A); break;
		case 83: // 's' - qwerty, azerty
		case 79: // 'o' - dvorak
			callback(player, jsnes.Controller.BUTTON_B); break;
		case 9: // Tab
			callback(player, jsnes.Controller.BUTTON_SELECT); break;
		case 13: // Return
			callback(player, jsnes.Controller.BUTTON_START); break;
		default: break;
	}
}

Emulator.prototype.audio_remain = function () {
	return (audio_write_cursor - audio_read_cursor) & SAMPLE_MASK;
}

Emulator.prototype.audio_callback = function () {
	var dst = event.outputBuffer;
	var len = dst.length;

	// Attempt to avoid buffer underruns.
	if (audio_remain() < AUDIO_BUFFERING) nes.frame();

	var dst_l = dst.getChannelData(0);
	var dst_r = dst.getChannelData(1);
	for (var i = 0; i < len; i++) {
		var src_idx = (audio_read_cursor + i) & SAMPLE_MASK;
		dst_l[i] = audio_samples_L[src_idx];
		dst_r[i] = audio_samples_R[src_idx];
	}

	audio_read_cursor = (audio_read_cursor + len) & SAMPLE_MASK;
}

module.exports = {
	Emulator,
	SCREEN_WIDTH,
	SCREEN_HEIGHT,
	FRAMEBUFFER_SIZE,
	canvas,
	image,
	framebuffer_u8,
	framebuffer_u32,
	AUDIO_BUFFERING,
	SAMPLE_COUNT,
	SAMPLE_MASK,
	audio_samples_L,
	audio_samples_R,
	audio_write_cursor,
	audio_read_cursor,
	rom_data
}