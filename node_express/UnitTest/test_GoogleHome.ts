import assert = require('assert');

import { globalVars, getLocalAddress } from '../variables';
import { GoogleHomeController } from '../gHomeCnt';

describe("GoogleHome", () => {
    require('dotenv').config();

    it("seek_01",async () => {
        console.log(await GoogleHomeController.seekGoogleHomes(3000, null));
    }).timeout(5000);
});
