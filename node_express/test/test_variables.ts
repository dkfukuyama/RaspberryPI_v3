import assert = require('assert');

import { globalVars, getLocalAddress } from '../variables';


describe("variables", () => {
    require('dotenv').config();
    console.log("process.env.serverPort");
    console.log(process.env.serverPort);

    it("globalVars_01", () => {
        console.log(globalVars());
        assert.equal(false, globalVars().errorFlag);
        assert.equal(9000, globalVars().serverPort);
    });

    it("getLocalAddress_01", () => {
        console.log(getLocalAddress());
    });
});
