import assert = require('assert');
import path = require('path');

import { GoogleTTS } from '@/GoogleTTS';


require('dotenv').config({ path: ".env_test" });
//import { AppConf } from '@/AppConf';

describe("GoogleTTS", () => {
	it("get_file_01", () => {
		const output_dir = path.join(__dirname, "TEST_RESULTS");
		GoogleTTS.GetTtsAudioData({
			outfilePath: path.join(output_dir, 'get_file_01.mp3'),
			text: 'テストデータだよ',
			speakingRate: 1,
			pitch: 0,
			voiceTypeId: 0,
		});
	});
});
