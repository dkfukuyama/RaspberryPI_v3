var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const textToSpeech = require('@google-cloud/text-to-speech');
//const { rejects } = require('assert');
// Import other required libraries
const fs = require('fs');
//const { exit } = require('process');
const util = require('util');
// Creates a client
const client = new textToSpeech.TextToSpeechClient();
const voiceType = [
    { languageCode: 'ja-JP', 'name': 'ja-JP-Standard-A', show_name: 'にほんご1' },
    { languageCode: 'ja-JP', 'name': 'ja-JP-Standard-B', show_name: 'にほんご2' },
    { languageCode: 'ja-JP', 'name': 'ja-JP-Standard-C', show_name: 'にほんご3' },
    { languageCode: 'ja-JP', 'name': 'ja-JP-Standard-D', show_name: 'にほんご4' },
    { languageCode: 'ta-IN', 'name': 'ta-IN-Wavenet-A', show_name: 'タミルご(インド)1' },
    { languageCode: 'en-US', 'name': 'en-US-Standard-A', show_name: 'えいご（アメリカ）1' },
    { languageCode: 'yue-HK', 'name': 'yue-HK-Standard-A', show_name: 'ちゅうごくご（ほんこん）1' },
    { languageCode: 'cs-CZ', 'name': 'cs-CZ-Standard-A', show_name: 'チェコご1' },
    { languageCode: 'fr-FR', 'name': 'fr-FR-Standard-A', show_name: 'フランスご1' },
    { languageCode: 'ko-KR', 'name': 'ko-KR-Standard-A', show_name: 'かんこくご1' },
];
function getTtsAudioData(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let vt = (_a = params.voiceTypeId) !== null && _a !== void 0 ? _a : 0;
            vt = (!isNaN(vt) && vt >= 0 && vt < voiceType.length) ? vt : 0;
            let enc = null;
            if (params.outfilePath.endsWith('.wav')) {
                enc = 'LINEAR16';
            }
            else if (params.outfilePath.endsWith('.mp3')) {
                enc = 'MP3';
            }
            // Construct the request
            const request = {
                input: { text: ((_b = params.text) !== null && _b !== void 0 ? _b : params.text.length() > 0) ? params.text : '入力エラー' },
                // Select the language and SSML voice gender (optional)
                voice: voiceType[vt],
                // select the type of audio encoding
                audioConfig: {
                    audioEncoding: enc,
                    pitch: (_c = params.pitch) !== null && _c !== void 0 ? _c : "0.00",
                    speakingRate: (_d = params.speakingRate) !== null && _d !== void 0 ? _d : "1.00"
                },
            };
            try {
                let sto = setTimeout(() => reject('time out getTtsAudioData'), 60000);
                // Performs the text-to-speech request
                const [response] = yield client.synthesizeSpeech(request);
                // Write the binary audio content to a local file
                const writeFile = util.promisify(fs.writeFile);
                yield writeFile(params.outfilePath, response.audioContent, 'binary');
                console.log(`Audio content written to file: ${params.outfilePath}`);
                clearTimeout(sto);
                resolve();
            }
            catch (err) {
                reject(err);
            }
        }));
    });
}
exports.voiceType = voiceType;
exports.getTtsAudioData = getTtsAudioData;
//# sourceMappingURL=google_tts.js.map