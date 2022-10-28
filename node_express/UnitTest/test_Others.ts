import assert = require('assert');
import path = require('path');

require('dotenv').config({ path: ".env_test" });
import { GoogleHomeController } from '@/GoogleHomeController';

describe("GoogleHomeController.Sox_", () => {
	it("SoxConfUrlEncode_01", () => {
		let str = GoogleHomeController.SoxConfUrlEncode({
			pitch: 8,
			tempo: 1.8
		});
		assert.equal(str, "pitch=8&tempo=1.8&sox=true" );
	});
	it("BuildSoxCommand_01", () => {
		let str = GoogleHomeController.BuildSoxCommand(
			"path.mp3",
			{ pitch: 300, tempo: 0.5 });
		assert.equal(str, `sox "path.mp3" -t wav - pitch 300 tempo 0.5`);
	});
});
