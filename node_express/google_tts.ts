const textToSpeech = require('@google-cloud/text-to-speech');
//const { rejects } = require('assert');

// Import other required libraries
const fs = require('fs');
//const { exit } = require('process');
const util = require('util');
// Creates a client
const client = new textToSpeech.TextToSpeechClient();

const voiceType = [
  {languageCode: 'ja-JP', 'name':'ja-JP-Standard-A', show_name: 'にほんご1'},
  {languageCode: 'ja-JP', 'name':'ja-JP-Standard-B', show_name: 'にほんご2'},
  {languageCode: 'ja-JP', 'name':'ja-JP-Standard-C', show_name: 'にほんご3'},
  {languageCode: 'ja-JP', 'name':'ja-JP-Standard-D', show_name: 'にほんご4'},
  {languageCode: 'ta-IN', 'name':'ta-IN-Wavenet-A', show_name: 'タミルご(インド)1'},
  {languageCode: 'en-US', 'name':'en-US-Standard-A', show_name: 'えいご（アメリカ）1'},
  {languageCode: 'yue-HK', 'name':'yue-HK-Standard-A', show_name: 'ちゅうごくご（ほんこん）1'},
  {languageCode: 'cs-CZ', 'name':'cs-CZ-Standard-A', show_name: 'チェコご1'},
  {languageCode: 'fr-FR', 'name':'fr-FR-Standard-A', show_name: 'フランスご1'},
  {languageCode: 'ko-KR', 'name':'ko-KR-Standard-A', show_name: 'かんこくご1'},
]

async function getTtsAudioData(params) {
  return new Promise<void>(async (resolve, reject)=>{

    let vt = params.voiceTypeId ?? 0;
    vt = (!isNaN(vt) && vt >=0 && vt <voiceType.length) ? vt : 0;

    let enc = null;
    if(params.outfilePath.endsWith('.wav')){
      enc = 'LINEAR16';
    }else if(params.outfilePath.endsWith('.mp3')){
      enc = 'MP3';
    }

    // Construct the request
    const request = {
      input: {text: params.text ?? params.text.length() > 0 ? params.text : '入力エラー'},
      // Select the language and SSML voice gender (optional)
      voice: voiceType[vt],
      // select the type of audio encoding
      audioConfig: {
        audioEncoding: enc,
        pitch: params.pitch ?? "0.00",
        speakingRate: params.speakingRate ?? "1.00"
      },
    };

    try{
      let sto = setTimeout(()=>reject('time out getTtsAudioData'), 60000);
      // Performs the text-to-speech request
      const [response] = await client.synthesizeSpeech(request);
      // Write the binary audio content to a local file
      const writeFile = util.promisify(fs.writeFile);
      await writeFile(params.outfilePath, response.audioContent, 'binary');
      console.log(`Audio content written to file: ${params.outfilePath}`);
      clearTimeout(sto);
      resolve();
    }catch(err){
      reject(err);
    }
  });
}

exports.voiceType = voiceType;
exports.getTtsAudioData = getTtsAudioData;
