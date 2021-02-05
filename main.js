const robot = require('robotjs');
robot.setKeyboardDelay(20);
const hotkey = require('node-hotkeys');
const userConfig = require('./config');
const defaultConfig = {
	activationKey: 'F7',
	fishingRodType: 0
};
const config = {...defaultConfig, ...userConfig};
let botTimer;
const baitMaxUseCount = config.fishingRodType == 0 ? 30 : 5;

const preventGoingAFK = () => robot.keyTap('space');
const pullTheFishingRod = () => robot.mouseClick();

function main() {
	// there will be checking if player should already pull the fishing rod, pulling it and taking baits from inventory
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

async function enableBot() {
	await writeInConsole('BOT ON ');
	botTimer = setInterval(main, 500);
	console.log(new Date().toLocaleString() + ': włączono bota');
}

async function disableBot() {
	await writeInConsole('BOT OFF ');
	clearInterval(botTimer);
	botTimer = undefined;
	console.log(new Date().toLocaleString() + ': wyłączono bota');
}

hotkey.on({
	hotkeys: config.activationKey,
	matchAllModifiers: true,
	useKeyDown: true,
	triggerAll: true,
	callback: () => !botTimer ? enableBot() : disableBot()
});