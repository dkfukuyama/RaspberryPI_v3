const gh = require('./google_home');

require('date-utils');

async function test_main() {
    let dts = Date.Today;
    let dte = Date.Tomorrow;
    console.log(dts);
    console.log(dte);

    let g = await gh.getCalJson(dts, dte);
    console.log(g);
}


test_main();
