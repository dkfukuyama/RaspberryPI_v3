import assert = require('assert');
import path = require('path');
import { ISoxConfig } from '@/GoogleHomeController';

require('dotenv').config({ path: ".env_test" });
import { GoogleHomeController } from '@/GoogleHomeController';

describe("GoogleHomeController.Sox_", () => {
	it("SoxConfUrlEncode_01", () => {
		let str = GoogleHomeController.SoxConfUrlEncode({
			pitch: 8,
			tempo: 1.8
		});
		assert.equal(str, "?pitch=8&sox=true&tempo=1.8");
	});
	it("SoxConfUrlEncode_02", () => {
		let Sox: ISoxConfig = {
			pitch: 1.5,
			tempo: 0.7,
			sox: true,
		}
		let str = GoogleHomeController.SoxConfUrlEncode(Sox);
		assert.equal(str, "?pitch=1.5&sox=true&tempo=0.7");
	});

	it("SoxConfUrlEncode_03", () => {
		let Sox: ISoxConfig = {
			pitch: 0,
			tempo: 1,
			sox: true,
		}
		let str = GoogleHomeController.SoxConfUrlEncode(Sox);
		assert.equal(str, "");
	});

	it("SoxConfUrlEncode_04", () => {
		let Sox: ISoxConfig = {
			pitch: 0,
			tempo: 1,
			sox: true,
		}

		assert.equal(true, GoogleHomeController.IsSoxDefaultValue(Sox));
	});

	it("SoxConfUrlEncode_05", () => {
		let Sox: ISoxConfig = {
			pitch: 0,
			tempo: 1,
			effectsPreset : "",
			effectsString : "",
			sox: true,
		}
		assert.equal(true, GoogleHomeController.IsSoxDefaultValue(Sox));
	});

	it("BuildSoxCommand_01", () => {
		let str = GoogleHomeController.BuildSoxCommand(
			"path.mp3",
			{ pitch: 300, tempo: 0.5 });
		assert.equal(str, `sox "path.mp3" -t wav - pitch 300 tempo 0.5`);
	});
});
