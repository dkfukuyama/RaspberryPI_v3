export function InitEnv() {
	const envDestFileName = '.env';
	const envInpFileNames = ['.env.common', '.env.secret'];
	const enc = 'utf8';
	envInpFileNames.map(f => require('fs').readFileSync(f, enc)).forEach((t, i) => {
		require('fs').writeFileSync(envDestFileName, t, { flag: i == 0 ? 'w' : 'a' });
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
