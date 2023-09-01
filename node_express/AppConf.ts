import path = require('path');
import { Slack, SlackApi } from '@/SlackSend';
export const slk = new Slack(process.env.SLACK_WEBHOOK);
export const slkapi = new SlackApi(process.env.SLACK_API_TOKEN);


const httpServerPort_Default = 80;
const httpsServerPort_Default = 443;

export interface IGL {
	SoxCommandPath?: string;
	RecCommandLine: string;
	RecCommandLineReplacer: { outfile: string, length: string }|null;

	music_shortcut_dir?: string;

	UseSocketIoExpress?: boolean;

    errorFlag: boolean;
    httpServerPort: number;
	httpsServerPort: number;
    voiceSubDir: string;
    recDir: string;

    httpDir0: string;
    httpDir_music: string;
    httpDir: string;

	httpsDir0: string;
	httpsDir_music: string;
	httpsDir: string;

    saveDir0: string;
    saveDir: string;
}

let GL_VARS: IGL = {
	RecCommandLine: "",
	RecCommandLineReplacer: null,

	errorFlag: false,
    httpServerPort: httpServerPort_Default,
	httpsServerPort: httpsServerPort_Default,

	voiceSubDir: '',
	recDir: '',

	music_shortcut_dir: '.',

	httpDir0: '',
    httpDir_music: '',
    httpDir: '',

	httpsDir0: '',
	httpsDir_music: '',
	httpsDir: '',

    saveDir0: '',
    saveDir: '',
};

let firstTry = true;

export function AppConf(): IGL {
	try {
		if (firstTry || GL_VARS.errorFlag) {
			console.log("LOAD VAL");
			GL_VARS.errorFlag = true;
			GL_VARS.httpServerPort = (parseInt(process.env.HTTP_SERVER_PORT) || GL_VARS.httpServerPort);
			GL_VARS.httpsServerPort = (parseInt(process.env.HTTPS_SERVER_PORT) || GL_VARS.httpsServerPort);
			GL_VARS.voiceSubDir = (process.env.VOICE_SUBDIR ?? 'g_dlfile');

			console.log({ TEST_MODE : process.env.TEST_IPV4 });
			if (process.env.TEST_IPV4) {
				GL_VARS.httpDir0 = `${process.env.TEST_IPV4}`;
				GL_VARS.httpsDir0 = `${process.env.TEST_IPV4}`;
			} else {
				const ipv4 = getLocalAddress().ipv4;
				if (!ipv4.length) throw new Error('Http Addr cannot be detected');
				GL_VARS.httpDir0 = `${ipv4[0].address}`;
				GL_VARS.httpsDir0 = `${ipv4[0].address}`;
			}
			if (GL_VARS.httpServerPort != httpServerPort_Default) GL_VARS.httpDir0 += `:${GL_VARS.httpServerPort}`;
			if (GL_VARS.httpsServerPort != httpsServerPort_Default) GL_VARS.httpsDir0 += `:${GL_VARS.httpsServerPort}`;

			GL_VARS.httpDir_music = "http://" + GL_VARS.httpDir0;
			GL_VARS.httpDir = "http://" + path.posix.join(GL_VARS.httpDir0, GL_VARS.voiceSubDir);

			GL_VARS.httpsDir_music = "http://" + GL_VARS.httpsDir0;
			GL_VARS.httpsDir = "http://" + path.posix.join(GL_VARS.httpsDir0, GL_VARS.voiceSubDir);

			GL_VARS.saveDir0 = process.env.SAVE_DIR_0;
			if (process.env.SAVE_DIR_0_IS_RELPATH) GL_VARS.saveDir0 = path.join(__dirname, GL_VARS.saveDir0);

			GL_VARS.saveDir = path.join(GL_VARS.saveDir0, GL_VARS.voiceSubDir);
			GL_VARS.recDir = path.join(GL_VARS.saveDir0, GL_VARS.voiceSubDir);

			GL_VARS.SoxCommandPath = process.env.SOX;

			GL_VARS.RecCommandLine = process.env.REC_COMMAND_LINE;
			GL_VARS.RecCommandLineReplacer = {
				outfile: process.env.REC_REPLACE_OUTFILE,
				length: process.env.REC_REPLACE_LENGTH,
			};

			GL_VARS.UseSocketIoExpress = process.env.USE_SOCKET_IO_EXPRESS ? true : false;

			GL_VARS.music_shortcut_dir = process.env.MUSIC_SHORTCUT_FOLDER ? process.env.MUSIC_SHORTCUT_FOLDER : GL_VARS.music_shortcut_dir;

            firstTry = false;
        }
        GL_VARS.errorFlag = false;
    } catch (err) {
        GL_VARS.errorFlag = true;
        console.error(err);
    } finally {
        return GL_VARS;
    }
}

export function getLocalAddress() {

    let ifacesObj: any = {};
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = require('os').networkInterfaces();

    for (let dev in interfaces) {
        interfaces[dev].forEach(function (details: any) {
            if (!details.internal) {
                let add0: string = details?.address ?? '';
                switch(details.family){
                    case 4:
                    case "IPv4":
                        ifacesObj.ipv4.push({name:dev, address:add0});
                    break;
                    case 6:
                    case "IPv6":
                        ifacesObj.ipv6.push({name:dev, address:add0})
                    break;
                }
            }
        });
    }
    return ifacesObj;
};

export function GetStandardFileName(param:{
	dir?: string,
	ext?: ".wav" | ".mp3"
} | null): string {

	const ext = param?.ext ?? ".wav";
	const dir = param?.dir ?? "";

	let dt: any = new Date();
	let y = dt.getFullYear();
	let m = ("00" + (dt.getMonth() + 1)).slice(-2);
	let d = ("00" + dt.getDate()).slice(-2);
	let h = ("00" + dt.getHours()).slice(-2);
	let min = ("00" + dt.getMinutes()).slice(-2);
	let sec = ("00" + dt.getSeconds()).slice(-2);
	let ms = ("000" + dt.getMilliseconds()).slice(-3);
	let result = `${y}-${m}-${d}_${h}-${min}-${sec}_${ms}${ext}`;
	return path.join(dir, result);
}

export function GetStandardFileNames(param: {
	dir?: string[],
	ext?: ".wav" | ".mp3"
} | null): string[] {

	const ext = param?.ext ?? ".wav";
	const dir = param?.dir ?? [];

	let dt: any = new Date();
	let y = dt.getFullYear();
	let m = ("00" + (dt.getMonth() + 1)).slice(-2);
	let d = ("00" + dt.getDate()).slice(-2);
	let h = ("00" + dt.getHours()).slice(-2);
	let min = ("00" + dt.getMinutes()).slice(-2);
	let sec = ("00" + dt.getSeconds()).slice(-2);
	let ms = ("000" + dt.getMilliseconds()).slice(-3);
	let result = `${y}-${m}-${d}_${h}-${min}-${sec}_${ms}${ext}`;
	return dir.map(d=>path.join(d, result));
}
