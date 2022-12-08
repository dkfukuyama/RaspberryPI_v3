import { ISoxConfig } from "./GoogleHomeController";

export class GoogleTTS {

	static readonly textToSpeech = require('@google-cloud/text-to-speech');
	static readonly client = new GoogleTTS.textToSpeech.TextToSpeechClient();
	static readonly fs = require('fs');
	static readonly util = require('util');

	static readonly VoiceType: { languageCode: string, name: string, show_name: string }[] = [
		{ languageCode: 'ja-JP', name: 'ja-JP-Standard-A', show_name: 'にほんご1' },
		{ languageCode: 'ja-JP', name: 'ja-JP-Standard-B', show_name: 'にほんご2' },
		{ languageCode: 'ja-JP', name: 'ja-JP-Standard-C', show_name: 'にほんご3' },
		{ languageCode: 'ja-JP', name: 'ja-JP-Standard-D', show_name: 'にほんご4' },
		{ languageCode: 'ta-IN', name: 'ta-IN-Wavenet-A', show_name: 'タミルご(インド)1' },
		{ languageCode: 'en-US', name: 'en-US-Standard-A', show_name: 'えいご（アメリカ）1' },
		{ languageCode: 'yue-HK', name: 'yue-HK-Standard-A', show_name: 'ちゅうごくご（ほんこん）1' },
		{ languageCode: 'cs-CZ', name: 'cs-CZ-Standard-A', show_name: 'チェコご1' },
		{ languageCode: 'fr-FR', name: 'fr-FR-Standard-A', show_name: 'フランスご1' },
		{ languageCode: 'ko-KR', name: 'ko-KR-Standard-A', show_name: 'かんこくご1' },
		{ languageCode: 'ar-XA', name: 'ar-XA-Standard-B', show_name: 'アラビア語' },
		{ languageCode: 'bn-IN', name: 'bn-IN-Wavenet-A', show_name: 'ベンガル語１' },
		{ languageCode: 'bn-IN', name: 'bn-IN-Wavenet-B', show_name: 'ベンガル語２' },
		{ languageCode: 'ru-RU', name: 'ru-RU-Standard-D', show_name: 'ロシア語１' },
		{ languageCode: 'ru-RU', name: 'ru-RU-Standard-E', show_name: 'ロシア語２' },
	];

	static async GetTtsAudioData(params: {
		voiceTypeId: number,
		outfilePath: string,
		speaking_rate?: number, // 0.25 --- 4.0
		pitch?: number, // -20.0, 20.0
		text: string,
		speakingRate?: number,
		pitch?: number,
	}) {
		return new Promise<void>(async (resolve, reject) => {

			let vt = params.voiceTypeId ?? 0;
			vt = (!isNaN(vt) && vt >= 0 && vt < GoogleTTS.VoiceType.length) ? vt : 0;

			let enc = null;
			if (params.outfilePath.endsWith('.wav')) {
				enc = 'LINEAR16';
			} else if (params.outfilePath.endsWith('.mp3')) {
				enc = 'MP3';
			}

			// Construct the request
			const request = {
				input: { text: params.text ?? params.text.length > 0 ? params.text : '入力エラー' },
				// Select the language and SSML voice gender (optional)
				voice: GoogleTTS.VoiceType[vt],
				// select the type of audio encoding
				audioConfig: {
					audioEncoding: enc,
					speakingRate: params.speakingRate ?? 1,
					pitch: params.pitch ?? 0,
				},
			};

			try {
				let sto = setTimeout(() => reject('time out getTtsAudioData'), 10000);
				// Performs the text-to-speech request
				const [response] = await GoogleTTS.client.synthesizeSpeech(request);
				// Write the binary audio content to a local file
				const writeFile = GoogleTTS.util.promisify(GoogleTTS.fs.writeFile);
				await writeFile(params.outfilePath, response.audioContent, 'binary');
				console.log(`Audio content written to file: ${params.outfilePath}`);
				clearTimeout(sto);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}
}
