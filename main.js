const robot = require('robotjs');
robot.setKeyboardDelay(20);
const hotkey = require('node-hotkeys');
const userConfig = require('./config');
const defaultConfig = {
	activationKey: 'F7',
	fishingRodType: 0,
	resolution: 'FHD'
};
const config = {...defaultConfig, ...userConfig};
let botTimer;
let waveAnalyzerTimer;
const baitMaxUseCount = config.fishingRodType == 0 ? 30 : 5;
const waveInterval = 2400;

const positions = {
	FHD: {
		rectangle: {x: 800, y: 900},
		waveBeginning: {x: 800, y: 947},
		defaultBait: {x: 959, y: 918},
		pulledBait: {x: 959, y: 928}
		// move of the wave and the bait: 10px - every 2400ms
	}
}

const hexToRgb = hex =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
             ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
	.map(x => parseInt(x, 16));

function deltaE(rgbA, rgbB) {
	let labA = rgb2lab(rgbA);
	let labB = rgb2lab(rgbB);
	let deltaL = labA[0] - labB[0];
	let deltaA = labA[1] - labB[1];
	let deltaB = labA[2] - labB[2];
	let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
	let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
	let deltaC = c1 - c2;
	let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
	deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
	let sc = 1.0 + 0.045 * c1;
	let sh = 1.0 + 0.015 * c1;
	let deltaLKlsl = deltaL / (1.0);
	let deltaCkcsc = deltaC / (sc);
	let deltaHkhsh = deltaH / (sh);
	let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
	return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb){
	let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
	r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
	g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
	b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
	x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
	y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
	z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
	x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
	y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
	z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
	return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function isColorSimilar(c1, c2){
	let color1 = hexToRgb('#'+c1),
		color2 = hexToRgb('#'+c2);
	return (deltaE(color1, color2) < 10) ? true : false;
}

function analyzeWave() {
	const matchingColor ='c9c9c9';
	const color = robot.getPixelColor(positions[config.resolution].waveBeginning.x, positions[config.resolution].waveBeginning.y);
	if (isColorSimilar(matchingColor, color)) {
		const date = new Date();
		const nextDate = new Date(date.getTime() + waveInterval);
		console.log(`ANALIZATOR FALI | Znaleziono falę w ${date.toLocaleTimeString()}:${date.getMilliseconds()}. Następna przewidywana fala pojawi się w: ${nextDate.toLocaleTimeString()}:${nextDate.getMilliseconds()}`)
		if (!botTimer) botTimer = setInterval(main, waveInterval);
		else correctInterval();
	}
}

const preventGoingAFK = () => robot.keyTap('space');
const pullTheFishingRod = async () => robot.mouseClick();

function isPlayerFishing() { // checking if player has fishing rectangle shown
	const matchingColor = '111111';
	const color = robot.getPixelColor(positions[config.resolution].rectangle.x, positions[config.resolution].rectangle.y);
	return matchingColor == color;
}


function checkIfPlayerIsOutOfBait() {

}

function takeBaitFromInventory() {

}

async function main() {
	// there will be checking if player should already pull the fishing rod, pulling it and taking baits from inventory
	preventGoingAFK();
	if (!isPlayerFishing()) { 
		await pullTheFishingRod();
		if (!isPlayerFishing()) {
			// taking bait from inventory there
		}
	}

	// checking if bait is in the right place and player should press left mouse button there


	setInterval( () => { // check for desynchronization every 3 minutes
		enableWaveAnalyzer();
	}, 60000 * 3);
}

function correctInterval() {
	if (!botTimer) return;
	clearInterval(botTimer);
	botTimer = setInterval(main, waveInterval);
}

async function writeInConsole(text) {
	robot.keyTap('f8');
	robot.keyTap('a', 'control');
	robot.keyTap('backspace');
	robot.typeStringDelayed(text, 700);
	await new Promise(resolve => setTimeout(() => {
		robot.keyTap('f8');
		resolve();
	}, 1000));
	return true;
}

function enableWaveAnalyzer() {
	waveAnalyzerTimer = setInterval(analyzeWave, 5);
	setTimeout(() => {
		if (waveAnalyzerTimer) { // if wave analyzer is still working it means it didnt find beginning of the wave
			console.log('BŁĄD! | Nie zdołano przeanalizować fali. Nie wiesz co to oznacza? Spytaj twórcy bota.');
			disableBot();
		}
	}, 10000);
}

async function enableBot() {
	await writeInConsole('BOT ON ');
	if (!isPlayerFishing()) {
		await pullTheFishingRod();
		if (!isPlayerFishing()) {
			// todo: first try to take bait from inventory - if it fails, then shutdown
			console.log('PROBLEM! | Nie udało się włączyć bota - gracz nie łowi. Próba naciśnięcia LPM w celu użycia wędki zakończyła się niepowodzeniem.');
			disableBot();
			return;
		}
	}
	enableWaveAnalyzer();
	console.log(new Date().toLocaleString() + ': włączono bota');
}

async function disableBot() {
	await writeInConsole('BOT OFF ');
	if (botTimer) {
		clearInterval(botTimer);
		botTimer = undefined;
	}
	if (waveAnalyzerTimer) {
		clearInterval(waveAnalyzerTimer);
		waveAnalyzerTimer = undefined;
	}
	console.log(new Date().toLocaleString() + ': wyłączono bota');
}

hotkey.on({
	hotkeys: config.activationKey,
	matchAllModifiers: true,
	useKeyDown: true,
	triggerAll: true,
	callback: () => (!botTimer && !waveAnalyzerTimer) ? enableBot() : disableBot()
});