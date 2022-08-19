import assert = require('assert');

import { globalVars, getLocalAddress } from '@/variables';
import { TextDecoder, TextEncoder } from 'util';

describe("variables", () => {
    require('dotenv').config();

    it("globalVars_01", () => {
        let s = "あいうえお";
        let a : any = new TextEncoder().encode(s);
        console.log(a.map((x) => x.toString(16)));
        console.log(a);
        console.log(new TextDecoder().decode(a));

        console.log(globalVars());
        assert.equal(false, globalVars().errorFlag);
        assert.equal(9000, globalVars().httpServerPort);
        assert.equal('192.168.100.100:9000', globalVars().httpDir0);
        assert.equal('http://192.168.100.100:9000/g_dlfile', globalVars().httpDir);
        assert.equal('http://192.168.100.100:9000', globalVars().httpDir_music);
    });

    it("getLocalAddress_01", () => {
        console.log(getLocalAddress());
    });
});
