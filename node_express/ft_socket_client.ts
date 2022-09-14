import { io } from 'socket.io-client';
const socket = io("ws://192.168.1.231:8080", { transports: ['websocket'] });

import * as AppFunctions from '@/AppFunctions'
import * as GHomeMonitor from '@/GHomeMonitor';

socket.on('test00', (data: AppFunctions.IAppFunctionResults) => {
	console.log(data);
})

socket.on("connect", async () => {
	console.log("connection OK");

	const send_data: AppFunctions.IAppFunctionArgs = {
		mode: 'test00',
		data: {
			a:"%%%",
			b: "%%%",
		}
	};
	socket.emit(send_data.mode, send_data.data);
	await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
	socket.close();
});

socket.connect();

