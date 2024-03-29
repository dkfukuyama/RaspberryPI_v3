import { addMinutes, addSeconds } from 'date-fns';
import { Socket, Server } from 'socket.io';

import { GoogleHomeController } from '@/GoogleHomeController';
import { FileListSearch } from '@/FileListSearch';
import { AppConf, slk } from '@/AppConf';
import * as AppFunctions from '@/AppFunctions';


export type TClient = 'MusicPlayer' | 'StatusController' | 'NotDetected';
export interface IStatus {
    client_type: TClient;
};

export interface IPlayMusicQuery {
    test_mp3_path: string;
	GStatusSimType: string;
	Speaker: {
		[id: string]: {
			Path?: string;
			IsOpen?: boolean;
		};
	}
};


export interface IGHomes {
	[Key: string]: {
		g: GoogleHomeController;
		lastUpdated: Date;
	}
}

export class SocketIoConnectionManager {
	private Io: Server;
	private SocketIoPort: number = 3000;

	private Status: IStatus;

	GetStatusAll: (test_json?: string) => object;
	GetGHomes: () => IGHomes;
	
	constructor(portnum: number, _getStatusAll: (a?:string) => object, _getGHomes: () => IGHomes, http:any, https:any) {

		this.SocketIoPort = portnum;
		this.GetStatusAll = _getStatusAll;
		this.GetGHomes = _getGHomes;
		this.Io = require("socket.io")(http);
		this.Io.on("connection", (socket: Socket) => {
			let socket_index: number[];
			socket = AppFunctions.ApplyToSocket(socket);
			let Client: {
				ConnectionStartTime: Date;
				Type: TClient;
				TestMp3path: string;
			};

			let FSearch: {
				[Key: string]: FileListSearch;
			} = {};
			let GStatusSimType: string | null = "";
			console.log(`Connected to the client whose IP address is ${socket.handshake.address}`);
			socket.emit("hello from server", { send_datetime: new Date() });

			let update_func = () => {
				let rep = this.GetStatusAll(GStatusSimType);
				socket.emit("S2C_send_status", rep);
			}
			let t: NodeJS.Timeout = setInterval(() => {
				update_func();
			}, 1000);
			socket.on('update', () => update_func());

			// receive a message from the client
			socket.on("hello from client", (data: { send_datetime: Date; client_type: TClient; query: IPlayMusicQuery  }) => {
				//slk.Log(data);
				if (data) {
					Client = {
						ConnectionStartTime: data?.send_datetime ?? new Date(),
						Type: data?.client_type ?? 'NotDetected',
						TestMp3path: data?.query?.test_mp3_path ?? '',
					}
					console.log(`hello from client :: ${Client.ConnectionStartTime} / TYPE :: ${Client.Type} `);
					GStatusSimType = data.query.GStatusSimType ?? "";
					Object.keys(this.GetGHomes()).map(gh => this.GetGHomes()[gh].g.AddUpdateList(socket));
				}
			});

			socket.on("C2S_play", (data) => {
				socket.emit("S2C_play_OK", null);
			});
			socket.on("C2S_stop", (data) => {
				socket.emit("S2C_stop_OK", null);
			});

			socket.on("C2S_request_musiclist", (data) => {
				let list_arg: string = data.dir;
				console.log(`C2S_request_musiclist :: ${data.addr} :: ${list_arg}`);

				if (Object.keys(FSearch).indexOf(data.addr) == -1)
				if (Client.TestMp3path) {
					FSearch[data.addr] = new FileListSearch(Client.TestMp3path);
				} else {
					FSearch[data.addr] = new FileListSearch(AppConf().saveDir0);
				}
				if (list_arg) FSearch[data.addr].GetInfo(list_arg);

				// Send FileList
				socket.emit("S2C_reply_musiclist", { ack: data, data: FSearch[data.addr].GetList() });
			});

			socket.on("error", (err) => {
				Object.keys(this.GetGHomes()).map(gh => this.GetGHomes()[gh].g.RemoveUpdateList(socket));
				console.log(err);
			});

			socket.on("connect_error", (err) => {
				Object.keys(this.GetGHomes()).map(gh => this.GetGHomes()[gh].g.RemoveUpdateList(socket));
				console.log(err);
			});

			socket.on("disconnect", (data) => {
				Object.keys(this.GetGHomes()).map(gh => this.GetGHomes()[gh].g.RemoveUpdateList(socket));
			});
		});
	}
}

export class GHomeMonitor {
	private GHomes: IGHomes;

    private SocketIoPort: number = 3000;
    private ConnectionManager: SocketIoConnectionManager;
	private MonitoringLoopInt: NodeJS.Timeout | null = null;
	private Http: any;
	private Https: any;

	public GetGHomes(): IGHomes { return this.GHomes; }

	constructor(socket_io_port: number) {
        GoogleHomeController.init();
        this.GHomes = {};
		this.SocketIoPort = socket_io_port;
    }
	public Start(http: any, https: any) {
		this.Http = http;
		this.Https = https;
        this.StartSpeakerMonitor();
		this.StartIOMonitor();
    }

    public StartSpeakerMonitor() {
        GoogleHomeController.startSeekGoogleLoop();
        setInterval(async () => {
            await this.Monitoring();
        }, 999);
    }

	public StartIOMonitor() {
		this.ConnectionManager = new SocketIoConnectionManager(this.SocketIoPort, (a?: string) => this.GetStatusAll(a), () => this.GetGHomes(), this.Http, this.Https);
    }

    public End() {
        GoogleHomeController.stopSeekGoogleLoop();
        if (this.MonitoringLoopInt) clearInterval(this.MonitoringLoopInt);
    }

    public GetGhObjByName(name: string): {g: GoogleHomeController; lastUpdated: Date;} | null {
        for (let key in this.GHomes) {
            if (this.GHomes[key].g.SelfStatus.speakerName == name) return this.GHomes[key];
        }
        return null;
    }

	public GetGhObjByAddress(name: string): { g: GoogleHomeController; lastUpdated: Date; } | null {
		try {
			let names = name?.replace(/_/g, "\.") ?? '';
			for (let key in this.GHomes) {
				console.log(key);
				if (key == names) return this.GHomes[key];
			}
		} catch (err) {
			console.log(err);
		}
		return null;
    }

	private CreateOrOverWriteObjects() {
		let addrs: string[] | null = GoogleHomeController.gHomeAddresses?.map(a => a.address);
		addrs?.forEach((ad: string) => {
			if (ad in this.GHomes) {
				this.GHomes[ad].g.SelfStatus = GoogleHomeController.gHomeAddresses.filter(gha => gha.address == ad)[0];
				this.GHomes[ad].lastUpdated = new Date();
			} else {
				this.GHomes[ad] = {
					g: new GoogleHomeController(ad, 5000, AppConf().httpDir_music, AppConf().SoxCommandPath),
                    lastUpdated: new Date(),
                }
                this.GHomes[ad].g.SelfStatus = GoogleHomeController.gHomeAddresses.filter(gha => gha.address == ad)[0];
            }
        })
        for (const key in this.GHomes) {
            if (addSeconds(this.GHomes[key].lastUpdated, 30) < new Date()) {
                this.GHomes[key].g.Finalize();
                delete this.GHomes[key];
            }
        }
    }

    private GetStatusAll(test_json?: string): object {
        if (test_json) {
            const gh = require(`@/FunctionTest/${test_json}`);
            gh.forEach(g => {
                g.Value.Status.volume.level += 0.01;
            });
            return gh;
        } else if (this.GHomes != null && Object.keys(this.GHomes).length > 0) {
            return Object.keys(this.GHomes).map(key => {
                return {
                    Key: key,
                    Value: this.GHomes[key].g.GetAllStatus()
                }
            });
        } else {
            return {};
        }
    }

    static count: number = 0;
    private async Monitoring(){
        GHomeMonitor.count++;

        this.CreateOrOverWriteObjects();

        try {
            // NOP
            () => { }
        } catch (err) {
            console.log("ERR DETECTED");
            console.error(err);
        }
    }
}

