const gh = require('./google_home');

require('date-utils');

async function test_main() {
    var d: any = new Date();
    let dts: any = d.Today;
    let dte: any = d.Tomorrow;
    console.log(dts);
    console.log(dte);

    let g = await gh.getCalJson(dts, dte);
    console.log(g);
}


test_main();
