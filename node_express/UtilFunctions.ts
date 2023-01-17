export function InitEnv() {
	const fs = require('fs');
	const envDestFileName = '.env';
	const envInpFileNames = ['.env.common', '.env.secret'];
	const enc = 'utf8';
	envInpFileNames.map(f => {
		console.log(f);
		if (fs.existsSync(f)) {
			return fs.readFileSync(f, enc);
		}
		console.log("NOT FOUND")
		return `#  NOT FOUND ${f}`;
	}).forEach((t, i) => {
		fs.writeFileSync(envDestFileName, t + '\r\n', { flag: i == 0 ? 'w' : 'a', encoding: enc});
	});
};


export async function delay_ms(timeout_ms) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => resolve(), timeout_ms < 0 ? 0 : timeout_ms);
    });
}

export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export function clearEventEmitter(emitter){
    emitter?.removeAllListeners(emitter.eventNames());
}

export function __LINE__() { return (new Error()).stack.split('\n')[2].split(':').reverse()[1]; };
