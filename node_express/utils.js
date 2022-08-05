async function delay_ms(timeout_ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), timeout_ms < 0 ? 0 : timeout_ms);
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

exports.getRandomInt = getRandomInt;
exports.delay_ms = delay_ms;