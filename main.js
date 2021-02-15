const userConfig = require('./config');
const os = require('os');
const defaultConfig = {
	activationKey: 'F7',
	AFKpreventionKey: 'insert',
	resolution: 'FHD'
};
const config = {...defaultConfig, ...userConfig};
let waveAnalyzerTimer;
const waveInterval = 2400;
let fullTime = false;
let botEnabled = false;
let lastSuccessfullFishing = new Date().getTime();


const usersWithAccess = [
	'EITHO',
	'DESKTOP-O411J5U', // Esquu
	'DESKTOP-62PPO62', // pszysiat PC
	'DESKTOP-QHPTV0R', // pszysiat laptop
	'DESKTOP-VIUF5NM' // next
];

function printStartupText(text1, text2) {
	console.log('=================================');
	console.log(`=== ${text1} ===`)
	console.log('=================================');
	console.log(`----${text2}----`);
	console.log(' ');
	console.log(' ');
}

function verifyAccess(withoutPrint) {
	const hostname = os.hostname();
	const found = usersWithAccess.find(user => user == hostname);
	if (found) {
		if (!withoutPrint) printStartupText('INSIDEMTA-BOT-FISHER v1.0', 'Nie wysyłaj tego nikomu');
		return true;
	} else {
		if (!withoutPrint) printStartupText('CHUJ-CI-W-DUPE', 'nic tu dla ciebie nie ma');
		return false;
	}
}

if (!verifyAccess()) {
	process.title = 'PornHub Premium accounts generator';
	return false;
}
process.title = 'Fishing bot';

const robot = require('robotjs');
robot.setKeyboardDelay(20);
const hotkey = require('node-hotkeys');
const fs = require('fs');
const Jimp = require('jimp');

const positions = {
	FHD: {
		rectangle: {x: 800, y: 900},
		waveBeginning: {x: 800, y: 947},
		defaultBait: {x: 960, y: 934},
		pulledBait: {x: 960, y: 944},
		baitNameArea: {x: 840, y: 985, width: 240, height: 22},
		// move of the wave and the bait: 10px - every 2400ms
		inventory: {
			star: {x: 1880, y: 381},
			firstItem: {x: 1360, y: 430},
			useFirstItem: {x: 1400, y: 475}
		}
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

function captureImage(x, y, w, h) {
	const pic = robot.screen.capture(x, y, w, h);
	const width = pic.byteWidth / pic.bytesPerPixel // pic.width is sometimes wrong!
	const height = pic.height
	const image = new Jimp(width, height)
	let red, green, blue
	pic.image.forEach((byte, i) => {
	  switch (i % 4) {
		case 0: return blue = byte
		case 1: return green = byte
		case 2: return red = byte
		case 3: 
		  image.bitmap.data[i - 3] = red
		  image.bitmap.data[i - 2] = green
		  image.bitmap.data[i - 1] = blue
		  image.bitmap.data[i] = 255
	  }
	})
	return image;
}

function getBaitImage(){
	return captureImage(positions[config.resolution].baitNameArea.x, positions[config.resolution].baitNameArea.y, positions[config.resolution].baitNameArea.width, positions[config.resolution].baitNameArea.height).crop(0, 0, positions[config.resolution].baitNameArea.width, positions[config.resolution].baitNameArea.height);
}

function saveImage(image){
	const name = Math.random().toString(36).substring(6)+'.png';
	image.write('img/'+name);
}

let images = [];
function loadImages(){
	fs.readdir('./img', (err, files) => {
		if (err) throw (err);
		files.forEach((file, index) => {
			fs.readFile('./img/'+file, (error, data) => {
				if (error) throw (error);
				images.push({key: file.split('.')[0], data});
			})
		});
	});
}

async function searchForBait(image){
	const toCompare = image;
	for (const img of images){
		const original = await Jimp.read(img.data);
		const diff = Jimp.diff(toCompare, original);
		if (diff.percent < 0.02){
			return img.key;
		}
	}
	return false;
}
loadImages();

function dupakupa(){
	const image = getBaitImage();
	saveImage(image);
}
//setTimeout(dupakupa, 4000); // do not uncomment if not needed

function analyzeWave() {
	const matchingColor ='c9c9c9';
	const color = robot.getPixelColor(positions[config.resolution].waveBeginning.x, positions[config.resolution].waveBeginning.y);
	if (isColorSimilar(matchingColor, color)) {
		main();
		setTimeout(main, waveInterval/2);
	}
}

const preventGoingAFK = async () => robot.keyTap(config.AFKpreventionKey);
const scrollToFishingRod = async () => await robot.scrollMouse(0, 20); // not working - robot.js fault
const pullTheFishingRod = async () => await robot.mouseClick();

function hasPlayerFishingWindowShown() { // checking if player has fishing rectangle shown
	const matchingColor = '111111';
	const color = robot.getPixelColor(positions[config.resolution].rectangle.x, positions[config.resolution].rectangle.y);
	return matchingColor == color;
}

function isPlayerFishing() {
	const matchingColor = 'dcdcdc';
	const color = robot.getPixelColor(positions[config.resolution].defaultBait.x, (fullTime ? positions[config.resolution].defaultBait.y : positions[config.resolution].defaultBait.y + 5));
	return matchingColor === color;
}

function shouldAlreadyPull() {
	const matchingColor = 'dcdcdc';
	const color = robot.getPixelColor(positions[config.resolution].pulledBait.x, (fullTime ? positions[config.resolution].pulledBait.y : positions[config.resolution].pulledBait.y + 5));
	return matchingColor === color;
}

function isInventoryOpen() {
	const matchingColor = 'b89935';
	const color = robot.getPixelColor(positions[config.resolution].inventory.star.x, positions[config.resolution].inventory.star.y);
	return matchingColor === color;
}

async function takeBaitFromInventory() {
	if (!isInventoryOpen())
		robot.keyTap('i');
	robot.moveMouse(positions[config.resolution].inventory.firstItem.x, positions[config.resolution].inventory.firstItem.y); // move mouse over first favorite item in inventory
	robot.mouseClick('right');
	robot.moveMouseSmooth(positions[config.resolution].inventory.useFirstItem.x, positions[config.resolution].inventory.useFirstItem.y); // move mouse over "Użyj" option
	robot.mouseClick();
	await new Promise(resolve => setTimeout(() => {
		robot.keyTap('i');
		resolve();
	}, 500));
}

async function main() {
	fullTime = !fullTime;
	if (shouldAlreadyPull()) {
		pullTheFishingRod();
		lastSuccessfullFishing = new Date().getTime();
		console.log('SUKCES | Złowiono rybę ' + new Date().toLocaleTimeString());
	}
	if (fullTime) {
		if (!hasPlayerFishingWindowShown()) { 
			await scrollToFishingRod();
			if (!hasPlayerFishingWindowShown()) {
				console.log('PROBLEM! | Prawdopodobnie nie masz wędki');
				disableBot();
				return;
			}
		}

		if (!isPlayerFishing() && !shouldAlreadyPull()) {
			await pullTheFishingRod();
			const image = getBaitImage();
			const bait = await searchForBait(image);
			console.log('bait: ', bait);
			if (!bait || bait == 'brak') {
				console.log('INFO | Podjęto próbę pobrania przynęty z ekwipunku');
				await takeBaitFromInventory();
			}
		}

		if (((new Date().getTime() - lastSuccessfullFishing)/1000) > 60) { // if fishing is "stuck" (bugged)
			robot.mouseClick();
			await new Promise(resolve => setTimeout(() => {
				robot.mouseClick();
				resolve();
			}, 1000));
		}
	}
	preventGoingAFK();
}

async function writeInConsole(text) {
	robot.keyTap('f8');
	robot.keyTap('a', 'control');
	robot.keyTap('backspace');
	robot.typeStringDelayed(text, 700);
	await new Promise(resolve => setTimeout(() => {
		robot.keyTap('f8');
		resolve();
	}, 500));
	return true;
}

function enableWaveAnalyzer() {
	waveAnalyzerTimer = setInterval(analyzeWave, 35);
}

async function enableBot() {
	if (!verifyAccess(true)) return false;
	console.log(new Date().toLocaleString() + ': włączono bota');
	botEnabled = true;
	await writeInConsole('ON');
	if (!hasPlayerFishingWindowShown()) {
		await scrollToFishingRod();
		if (!hasPlayerFishingWindowShown()) {
			console.log('PROBLEM! | Prawdopodobnie nie masz wędki lub przynęty - bot nie mógł zostać włączony.')
			disableBot();
			return;
		}
	}
	enableWaveAnalyzer();
	lastSuccessfullFishing = new Date().getTime();
}

async function disableBot() {
	await writeInConsole('OFF');
	if (waveAnalyzerTimer) {
		clearInterval(waveAnalyzerTimer);
		waveAnalyzerTimer = undefined;
	}
	botEnabled = false;
	console.log(new Date().toLocaleString() + ': wyłączono bota');
}

hotkey.on({
	hotkeys: config.activationKey,
	matchAllModifiers: true,
	useKeyDown: true,
	triggerAll: true,
	callback: () => !botEnabled ? enableBot() : disableBot()
});