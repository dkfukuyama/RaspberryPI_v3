import assert = require('assert');

require('dotenv').config({ path: ".env_test" });
import { globalVars, getLocalAddress } from '@/variables';

describe("variables", () => {
    it("globalVars_01", () => {
        console.log({ TEST_MODE: process.env.TEST_MODE });

        assert.equal(false, globalVars().errorFlag);
        assert.equal('192.168.100.100:9000', globalVars().httpDir0);
        assert.equal(9000, globalVars().httpServerPort);
        assert.equal('http://192.168.100.100:9000/g_dlfile', globalVars().httpDir);
        assert.equal('http://192.168.100.100:9000', globalVars().httpDir_music);
    });
});
