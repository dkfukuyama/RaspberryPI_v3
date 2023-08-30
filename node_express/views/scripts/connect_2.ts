import { FileListSearchResults } from "@/FileListSearch";
import { EPlayOptionIdName, ERepeatMode, ESoxEffectsPresetKey, IAppFunctionArgs_GHomeCnt, IAppFunctionArgs_PlayMusic, IPlayOption, ISendMusicCommand } from "@/GoogleHomeController";

declare const document: any;
declare const io: any;
declare const io_port_num: number;
declare const server_ws: string;
declare const XMLSerializer: any;

declare const XMLHttpRequest: any;
declare const alert: any;

declare const container_id: string;
declare const DOMParser: any;
declare const Node: any;

declare const client_type: any;
declare const location: any;


declare const special: any;

interface IMusicList {
	[index: string]: FileListSearchResults;
}
let MusicList: IMusicList = {};

// サーバーへ接続
const socket = io(server_ws, { transports: ['websocket'] });
socket.on("connect", () => {
	// send a message to the server
	socket.emit("hello from client", { send_datetime: new Date(), client_type: client_type, query: query });
});

// receive a message from the server
socket.on("hello from server", (data) => {
});

socket.on("S2C_reply_musiclist", (data) => {
	MusicList[data.ack.addr] = data.data;
});

socket.on("error", () => {
	AddToList("error");
});
socket.on("disconnect", () => {
	AddToList("disconnected");
});

socket.on("connect_error", (err) => {
	AddToList(err);
	setTimeout(() => {
		socket.connect();
	}, 1000);
});

function BuildPlayOption(Str: { [Key in EPlayOptionIdName]: string; }): IPlayOption {
	let return_value: IPlayOption = {
		RepeatMode: "REPEAT_SINGLE",
		PlayOrder: "CLEAR_OTHERS",
	};
	return_value.RepeatMode = Str['RepeatMode'] as ERepeatMode ?? 'REPEAT_OFF';
	return return_value;
}

function MusicSelectButtonClick(arg) {
	const elem1 = document.getElementById(arg.addr);

	let PlayOptions: {
		Num: {
			[Key: string]: number;
		}
		Str: {
			[Key in EPlayOptionIdName]: string;
		}
	} = {
		Num: {
			pitch: 0,
			tempo: 1,
		},
		Str: {
			SoxEffectsPreset: '',
			RepeatMode: '',
			PlayOrder: '',
		}
	}
	let tx_temp: string = "";

	Object.keys(PlayOptions.Num).forEach(t => {
		let ea = elem1.getElementsByClassName(t);
		PlayOptions.Num[t] = (ea?.length > 0 ? ea[0] : null)?.value;
	});
	Object.keys(PlayOptions.Str).forEach(t => {
		let ea = elem1.getElementsByClassName(t);
		PlayOptions.Str[t] = (ea?.length > 0 ? ea[0] : null)?.value;
	});

	let txt: string = "";
	Object.keys(PlayOptions.Num).forEach(t => {
		if (PlayOptions.Num[t]) txt += `\r\n${t} : ${PlayOptions.Num[t]}`;
	});
	Object.keys(PlayOptions.Str).forEach(t => {
		if (PlayOptions.Str[t]) txt += `\r\n${t} : ${PlayOptions.Str[t]}`;
	});

	alert(`${arg.title} を再生します\r\n\r\n${txt}`);
	let play_option: IPlayOption = BuildPlayOption(PlayOptions.Str)

	let send: IAppFunctionArgs_PlayMusic = {
		"mode": "play_music",
		data: {
			"SpeakerAddress": arg.addr,
			SoxConfig: [
				{
					pitch: PlayOptions.Num["pitch"],
					tempo: PlayOptions.Num["tempo"],
					effectsPreset: PlayOptions.Str["SoxEffectsPreset"] as ESoxEffectsPresetKey,
				},
			],
			PlayOption: play_option,
			Media: [
				{
					filePath: arg.filePath,
					title: arg.title,
				}
			]
		}
	};

	// JSONデータのPOST送信
	const url = '/command';
	const xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.open('POST', url);
	// サーバに対して解析方法を指定する
	xmlHttpRequest.setRequestHeader('Content-Type', 'application/json');
	// データをリクエスト ボディに含めて送信する
	xmlHttpRequest.send(JSON.stringify(send));
}

function DirSelectButtonClick(arg) {
	socket.emit("C2S_request_musiclist", { addr: arg.addr, dir: arg.dir });
}

function AddToList(str) {
	document.getElementById("MessageText").innerHTML = `<PRE>${str}</PRE>`;
}

interface IGoogleHomeSeekResults {
	address: string;
	friendlyName: string;
	speakerName: string;
}

interface GContainer { Key: string, Value: {Self: IGoogleHomeSeekResults, Status: any, PlayerStatus: any } };

