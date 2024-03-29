import { IMusicList } from "@/FileListSearch";
import { IPlayMusicQuery } from "@/GHomeMonitor";
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

declare const query: IPlayMusicQuery;

declare const special: any;

let MusicList: IMusicList = {};

// サーバーへ接続
const socket = io();
socket.on("connect", () => {
	AddToList("connection OK");
	// send a message to the server
	socket.emit("hello from client", { send_datetime: new Date(), client_type: client_type, query: query });
});

setInterval(()=>socket.emit("update"), 1000);

// receive a message from the server
socket.on("hello from server", (data) => {
	AddToList(`hello from server :: ${JSON.stringify(data, null, "\t")}`);
});

socket.on("S2C_send_status", (data) => {
	AddToList(`Status :: ${JSON.stringify(data, null, "\t")}`);
	ghhc.BuildHtml(data);
});

socket.on("S2C_play_OK", (data) => {
	AddToList(`Status :: ${JSON.stringify(data, null, "\t")}`);
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

class GoogleHomeHtmlContainer {
	private container: string;
	private load_html: string;
	private load_doc: any;

	constructor(_container_id: string) {
		this.container = _container_id;
	}

	async Load(): Promise<string> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', '/parts/SpeakerStatus.html');
			xhr.send();
			xhr.onload = ()=> {
				this.load_html = xhr.response;
				this.load_html = this.load_html.replace(new RegExp('<!--とくしゅこうか-->', 'g'), special.HtmlSoxEffectsPreset);
				this.load_html = this.load_html.replace(new RegExp('<!--くりかえし-->', 'g'), special.HtmlPlayOrder);
				this.load_html = this.load_html.replace(new RegExp('<!--じゅんばん-->', 'g'), special.HtmlRepeatMode);
				resolve(this.load_html);
			};
		});
    }

	BuildHtml(g_array: GContainer[] | null) {
		g_array.forEach(g => this.BuildHtml_sub(g));
	}

	static a: number = 0;
	BuildHtml_sub(g: GContainer) {

		let addr = g.Value.Self.address.replace(/\./g, "_");

		let elem1 = document.getElementById(addr);

		if (elem1 == null) {
			const parser = new DOMParser();
			let str: string = this.load_html.replace(/ID_NAME/g, addr).replace(/collapseExample/g, `collapse_${addr}`);

			this.load_doc = parser.parseFromString(str, 'text/html');
			let elem = this.load_doc.getElementById(addr);
			document.getElementById(this.container).appendChild(elem);
			elem1 = document.getElementById(addr);


			socket.emit("C2S_request_musiclist", { addr: addr, dir: '' });

			["pitch", "tempo"].forEach(t => {
				let ea = elem1.getElementsByClassName(t);
				let e = (ea?.length > 0 ? ea[0] : null);
				if (e) {
					e.onchange = () => {
						elem1.getElementsByClassName(t + "Text")[0].innerText = e.value;
					};
					e.onchange();
				}
			});
		}

		const v = g.Value;
		elem1.getElementsByClassName("speakerName")[0].innerText = v.Self.speakerName;
		elem1.getElementsByClassName('IpAddress')[0].innerText = v.Self.address;

		let vol0_100: number = Math.round((v.Status?.volume?.level ?? 0) * 100);
		elem1.getElementsByClassName('Volume')[0].innerText = vol0_100;
		elem1.getElementsByClassName('volume_slider')[0].value = vol0_100;
		elem1.getElementsByClassName('volume_slider')[0].oninput = () => {
			elem1.getElementsByClassName('Volume')[0].innerText = elem1.getElementsByClassName('volume_slider')[0].value;
		}

		elem1.getElementsByClassName('volume_slider')[0].onchange = () => {
			let send: IAppFunctionArgs_GHomeCnt =
			{
				"mode": "ghome_cnt_volume",
				data: {
					"SpeakerAddress": v.Self.address,
					Volume_0_100: elem1.getElementsByClassName('volume_slider')[0].value,
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

		if (v.Status?.applications && v.Status?.applications.length > 0) {
			elem1.getElementsByClassName('statusText')[0].innerText =
				v.PlayerStatus?.media?.metadata?.title ?? v.Status?.applications[0]?.statusText ?? "";
			elem1.getElementsByClassName('currentTime')[0].innerText = parseInt(v.PlayerStatus?.currentTime ?? "0");
			elem1.getElementsByClassName('duration')[0].innerText = parseInt(v.PlayerStatus?.media?.duration ?? "0");
		}

		if (addr in MusicList) {
		} else {
			MusicList[addr] = {
				DirList: [],
				FileList: [],
				PathNow: "",
				ErrorFlag: true,
			}
		}
		let out_html: string = "";
		if (addr in MusicList) {
			if (MusicList[addr].ErrorFlag == false) {
				out_html = `曲の一覧`;

				out_html += '<div class="row w-100">';
				MusicList[addr].FileList.forEach(f => {
					let parameters: ISendMusicCommand = {
						addr: addr,
						title: f.Name,
						filePath: f.Url,
					};
					let txt: string = JSON.stringify(parameters).replace(/"/g, '\'');
					out_html += `<div class="col-md-4 col-sm-6"><button class="btn btn-outline-info py-0 my-2 w-100" onclick="MusicSelectButtonClick(${txt})">${f.Name}</button></div>`;
				});
				out_html += '</div>';
				out_html += "<HR/>";
				out_html += `フォルダを移動する`;
				if (MusicList[addr].PathNow) out_html += `( 今のフォルダ⇒　${MusicList[addr].PathNow} )`;
				out_html += '<div class="row w-100">';
				MusicList[addr].DirList.forEach(f => {
					let parameters: ISendMusicCommand = {
						addr: addr,
						dir: f.Name,
					}
					let txt: string = JSON.stringify(parameters).replace(/"/g, '\'');
					out_html += `<div class="col-md-4 col-sm-6"><button class="btn btn-outline-success py-0 my-2 w-100" onclick="DirSelectButtonClick(${txt})">${f.Name}</button></div>`;
				})
				out_html += '</div>';
				out_html += '<div class="row w-100">';
				let parameters: ISendMusicCommand = {
					addr: addr,
					dir: "../",
				}
				let txt: string = JSON.stringify(parameters).replace(/"/g, '\'');
				out_html += `<div class="col"><button class="btn btn-outline-success py-0 my-2 w-100" onclick="DirSelectButtonClick(${txt})">上のフォルダへ</button></div>`;
				out_html += '</div>';
			} else {
				out_html = `<b><font color="red">よみこんでいます</font></b>`;
			}
			elem1.getElementsByClassName('music_selection')[0].innerHTML = out_html;
		}
	}
}

var ghhc = new GoogleHomeHtmlContainer(container_id);
ghhc.Load();

