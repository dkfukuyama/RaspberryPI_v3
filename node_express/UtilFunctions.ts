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
