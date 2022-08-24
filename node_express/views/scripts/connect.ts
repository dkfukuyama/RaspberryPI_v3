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

// サーバーへ接続
const socket = io(server_ws, { transports: ['websocket'] });
socket.on("connect", () => {
	AddToList("connection OK");
	// send a message to the server
	socket.emit("hello from client", { send_datetime: new Date() });
});

// receive a message from the server
socket.on("hello from server", (data) => {
	AddToList(`hello from server :: ${JSON.stringify(data, null, null)}`);
});

socket.on("S2C_send_status", (data) => {
	AddToList(`Status :: ${JSON.stringify(data, null, null)}`);
});

socket.on("S2C_play_OK", (data) => {
	AddToList(`Status :: ${JSON.stringify(data, null, null)}`);
});


socket.on("error", () => {
	// ...
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


function AddToList(str) {
	document.getElementById("inputText").innerHTML = `${str}<BR/>` + document.getElementById("inputText").innerHTML;
}

function buttonClick() {
	socket.emit("C2S_play", { send_datetime: new Date() });
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
			xhr.onload = function () {
				let responseObj = xhr.response;
				resolve(responseObj)
			};
		});
    }


	async Test(load_path: string): Promise<any> {
		this.TestLoadJson(load_path).then(o => {
			this.BuildHtml(o);
		});
	}


	async TestLoadJson(load_path: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', load_path);
			xhr.responseType = "json";
			xhr.send();
			xhr.onload = function () {
				let responseObj = xhr.response;
				resolve(responseObj)
			};
		});
	}

	async BuildHtml(g_array: GContainer[] | null) {

		this.load_html = await ghhc.Load();
		g_array.forEach(g => this.BuildHtml_sub(g));
		try {
			document.getElementsByName("vol").forEach(e => e.innerText = "123");
		} catch (err) {
			alert(err);
		}

	}

	BuildHtml_sub(g: GContainer) {
			const parser = new DOMParser();
			this.load_doc = parser.parseFromString(this.load_html, 'text/html');
			this.load_doc.getElementsByName('IpAddress')[0].innerText = g.Value.Self.address;
			const docString = new XMLSerializer().serializeToString(this.load_doc);
			document.getElementById(this.container).insertAdjacentHTML('beforeend', docString);
	}
}

const ghhc = new GoogleHomeHtmlContainer("container");
ghhc.Test('/__ftest__/test_02.json');
