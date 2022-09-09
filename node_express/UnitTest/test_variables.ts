import assert = require('assert');

require('dotenv').config({ path: ".env_test" });
import { AppConf} from '@/AppConf';

describe("variables", () => {
    it("globalVars_01", () => {
        console.log({ TEST_MODE: process.env.TEST_MODE });

        assert.equal(false, AppConf().errorFlag);
        assert.equal('192.168.100.100:9000', AppConf().httpDir0);
        assert.equal(9000, AppConf().httpServerPort);
        assert.equal('http://192.168.100.100:9000/g_dlfile', AppConf().httpDir);
        assert.equal('http://192.168.100.100:9000', AppConf().httpDir_music);
    });
});
