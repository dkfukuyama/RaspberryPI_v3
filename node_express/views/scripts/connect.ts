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

declare const query: {
	test_mp3_path: string;
};
declare const client_type: any;


type EType = "File" | "Directory" | "NotDetected";
interface FileInfo {
	BaseName: string;
	Ext: string;
	Name: string;
	ParentFullName: string;
	Url: string;
	FullName: string;
	CreationTime: Date;
	Type: EType;
}

interface FileListSearchResults {
	FileList: FileInfo[];
	DirList: FileInfo[];
	ErrorFlag: boolean;
}

interface IMusicList {
	[index: string]: FileListSearchResults;
}
let MusicList: IMusicList = {};

// サーバーへ接続
const socket = io(server_ws, { transports: ['websocket'] });
socket.on("connect", () => {
	AddToList("connection OK");
	// send a message to the server
	socket.emit("hello from client", { send_datetime: new Date(), client_type: client_type, query: query });
});

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

function MusicSelectButtonClick(arg) {
	alert(JSON.stringify(arg));
}

function DirSelectButtonClick(arg) {
	alert(JSON.stringify(arg));
}

function AddToList(str) {
	document.getElementById("MessageText").innerHTML = `<PRE>${str}</PRE>`;
}

interface IGoogleHomeSeekResults {
	address: string;
	friendlyName: string;
	speakerName: string;
}

interface GContainer { Key: string, Value: { Vol: any, Self: IGoogleHomeSeekResults, Status: any, PlayerStatus: any } };

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
				resolve(this.load_html)
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

			socket.emit("C2S_request_musiclist", { addr: addr });			
		}

		const v = g.Value;
		elem1.getElementsByClassName("speakerName")[0].innerText = v.Self.speakerName;
		elem1.getElementsByClassName('IpAddress')[0].innerText = v.Self.address;
		elem1.getElementsByClassName('Volume')[0].innerText = v.Status?.volume?.level * 100;
		elem1.getElementsByClassName('statusText')[0].innerText = v.Status?.applications[0]?.statusText;
		elem1.getElementsByClassName('currentTime')[0].innerText = v.PlayerStatus?.currentTime;
		elem1.getElementsByClassName('duration')[0].innerText = v.PlayerStatus?.media?.duration;


		if (addr in MusicList) {
		} else {
			MusicList[addr] = {
				DirList: [],
				FileList: [],
				ErrorFlag: true,
			}
		}
		let out_html: string = "";
		if (addr in MusicList) {
			if (MusicList[addr].ErrorFlag == false) {
				out_html = `曲の一覧`;
				let end_i: number;
				MusicList[addr].FileList.forEach((f, i) => {
					if (i % 3 == 0) out_html += '<div class="row">';
					out_html += `<div class="col"><button class="btn btn-outline-info py-0 my-2 w-100" onclick="MusicSelectButtonClick({'addr': '${addr}', 'file': '${f.Name}', 'full':'${f.FullName}' })">${f.Name}</button></div>`;
					if (i % 3 == 2) out_html += '</div>';
					end_i = i;
				})
				if (end_i % 3 != 2) out_html += '</div>';
				out_html += `フォルダを移動する`;

				MusicList[addr].DirList.forEach((f, i) => {
					if (i % 3 == 0) out_html += '<div class="row">';
					out_html += `<div class="col"><button class="btn btn-outline-success py-0 my-2 w-100" onclick="DirSelectButtonClick({'addr': '${addr}', 'file': '${f.Name}', 'full':'${f.FullName}'})">${f.Name}</button></div>`;
					if (i % 3 == 2) out_html += '</div>';
					end_i = i;
				})
				if (end_i % 3 != 2) out_html += '</div>';
			} else {
				out_html = `<b><font color="red">よみこんでいます</font></b>`;
			}
			elem1.getElementsByClassName('music_selection')[0].innerHTML = out_html;
		}
	}
}

var ghhc = new GoogleHomeHtmlContainer(container_id);
ghhc.Load();
