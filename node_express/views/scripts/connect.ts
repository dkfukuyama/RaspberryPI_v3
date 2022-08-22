declare const document: any;
declare const io: any;
declare const io_port_num: number;
declare const server_ws: string;

function AddToList(str) {
	document.getElementById("inputText").innerHTML = `${str}<BR/>` + document.getElementById("inputText").innerHTML;
}

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


function buttonClick() {
	socket.emit("C2S_play", { send_datetime: new Date() });
}
