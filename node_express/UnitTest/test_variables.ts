import assert = require('assert');
import { globalVars, getLocalAddress } from '@/variables';

describe("variables", () => {
    require('dotenv').config();

    it("globalVars_01", () => {
        console.log(globalVars());
        assert.equal(false, globalVars().errorFlag);
        assert.equal(9000, globalVars().httpServerPort);
        assert.equal('192.168.100.100:9000', globalVars().httpDir0);
        assert.equal('http://192.168.100.100:9000/g_dlfile', globalVars().httpDir);
        assert.equal('http://192.168.100.100:9000', globalVars().httpDir_music);
    });
});
