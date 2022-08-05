"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const variables_1 = require("../variables");
describe("variables", () => {
    require('dotenv').config();
    console.log("process.env.serverPort");
    console.log(process.env.serverPort);
    it("globalVars_01", () => {
        console.log((0, variables_1.globalVars)());
        assert.equal(false, (0, variables_1.globalVars)().errorFlag);
        assert.equal(9000, (0, variables_1.globalVars)().serverPort);
        assert.equal('192.168.100.100:9000', (0, variables_1.globalVars)().httpDir0);
        assert.equal('http://192.168.100.100:9000/g_dlfile', (0, variables_1.globalVars)().httpDir);
        assert.equal('http://192.168.100.100:9000', (0, variables_1.globalVars)().httpDir_music);
    });
    it("getLocalAddress_01", () => {
        console.log((0, variables_1.getLocalAddress)());
    });
});
//# sourceMappingURL=test_variables.js.map