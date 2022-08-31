import { addMinutes, addSeconds } from 'date-fns';

import { GoogleHomeController } from '@/GoogleHomeController';
import { FileListSearch } from '@/FileListSearch';
import { Socket, Server } from 'socket.io';
import { globalVars } from './variables';


interface IStatus {
    client_type: 'MusicPlayer' | 'StatusController'
}

export class SocketIoConnectionManager {
    private Io: Server;
    private SocketIoPort: number = 3000;
    private Status: IStatus;

    GetStatusAll: () => object;

    constructor(portnum: number, _getStatusAll: ()=>object) {
        this.SocketIoPort = portnum;
        this.GetStatusAll = _getStatusAll;
        this.Io = new Server();
        this.Io.on("connection", (socket: Socket) => {
            // send a message to the client

            let FSearch: FileListSearch;
            console.log(`Connected to the client whose IP address is ${socket.handshake.address}`);
            socket.emit("hello from server", { send_datetime: new Date() });

            let t: NodeJS.Timeout = setInterval(() => {
                socket.emit("S2C_send_status", this.GetStatusAll());
            }, 1000);

            // receive a message from the client
            socket.on("hello from client", (data: { send_datetime: Date; client_type: 'MusicPlayer' | 'StatusController' }) => {
                console.log(`hello from client :: ${data.send_datetime} / TYPE :: ${data.client_type}`);
                if (data.client_type == 'MusicPlayer') {
                    // FSearch = new FileListSearch('test_mp3'); テストモード
                    FSearch = new FileListSearch(globalVars().saveDir0);
                }
            });
            socket.on("C2S_play", (data) => {
                console.log(data);
                socket.emit("S2C_play_OK", null);
            });
            socket.on("C2S_stop", (data) => {
                socket.emit("S2C_stop_OK", null);
            });

            socket.on("C2S_request_musiclist", (data) => {
                console.log("C2S_request_musiclist");
                socket.emit("S2C_reply_musiclist", { ack: data, data: FSearch.GetList() });
            });


            socket.on("error", (err) => {
                console.log(err);
            });

            socket.on("connect_error", (err) => {
                console.log(err);
            });

            socket.on("disconnect", (data) => {
                clearTimeout(t);
            });

        });

        this.Io.listen(this.SocketIoPort);
        console.log("START Socket.IO Port Listening");
    }
}

export class GHomeMonitor {
    GHomes: {
        [Key: string]: {
            g: GoogleHomeController;
            lastUpdated: Date;
        }
    };

    private SocketIoPort: number = 3000;
    private SimulationMode: boolean | number = false;
    private ConnectionManager: SocketIoConnectionManager;

    private MonitoringLoopInt: NodeJS.Timeout | null = null;
    constructor(socket_io_port: number, sim_mode: boolean|number = false) {
        GoogleHomeController.init();
        this.GHomes = {};
        this.SocketIoPort = socket_io_port;
        this.SimulationMode = sim_mode;

        if (this.SimulationMode) {
            console.log(" xxxxxxx  SIMULATION MODE  xxxxxxxx");
            console.log({ SimulationMode : this.SimulationMode });
        }
    }
    public Start() {
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
        this.ConnectionManager = new SocketIoConnectionManager(this.SocketIoPort, () => this.GetStatusAll());
    }

    public End() {
        GoogleHomeController.stopSeekGoogleLoop();
        if (this.MonitoringLoopInt) clearInterval(this.MonitoringLoopInt);
    }

    private GetGhObjByName(name: string): {g: GoogleHomeController; lastUpdated: Date;} | null {
        for (let key in this.GHomes) {
            if (this.GHomes[key].g.SelfStatus.speakerName == name) return this.GHomes[key];
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
                    g: new GoogleHomeController(),
                    lastUpdated: new Date(),
                }
                this.GHomes[ad].g.SelfStatus = GoogleHomeController.gHomeAddresses.filter(gha => gha.address == ad)[0];
            }
        })
        for (const key in this.GHomes) {
            if (addSeconds(this.GHomes[key].lastUpdated, 30) < new Date()) {
                this.GHomes[key].g.Fnalize();
                delete this.GHomes[key];
            }
        }
    }

    private async UpdateGhStatusAll(): Promise<void> {
        for (let key in this.GHomes) {
            await this.GHomes[key].g.UpdateStatus();
            await this.GHomes[key].g.UpdateSessions();
            await this.GHomes[key].g.UpdatePalyerStatus();
        }
    }

    private GetStatusAll(): object {
        if (this.SimulationMode) {
            const gh = require('@/FunctionTest/test_02');
            gh.forEach(g => {
                g.Value.Status.volume.level += 0.01;
            });
            return gh;
        }else return Object.keys(this.GHomes).map(key => {
            return {
                Key: key,
                Value: this.GHomes[key].g.GetAllStatus()
            }
        });
    }

    static count: number = 0;
    private async Monitoring(){
        GHomeMonitor.count++;

        this.CreateOrOverWriteObjects();

        try {
            await this.UpdateGhStatusAll();
            
        } catch (err) {
            console.log("ERR DETECTED");
            console.error(err);
        }
    }
}

