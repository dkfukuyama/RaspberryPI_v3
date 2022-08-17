import { GoogleHomeController } from './gHomeCnt';
import { addMinutes, addSeconds } from 'date-fns';
import { EventEmitter } from 'stream';
import { Server } from "socket.io";

export class GHomeMonitor {
    GHomes: {
        [Key: string]: {
            g: GoogleHomeController;
            lastUpdated: Date;
        }
    };

    private SocketIo: EventEmitter | null = null;

    private MonitoringLoopInt: NodeJS.Timeout | null = null;
    constructor() {
        GoogleHomeController.init();
        this.GHomes = {};
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
        if (this.SocketIo != null) return;
        
        const { Server } = require("socket.io");

        const io = new Server({});
        io.on("connection", (socket) => {
            // send a message to the client
            console.log("CONNECTED");
            socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

            // receive a message from the client
            socket.on("hello from client", (args) => {
                console.log("hello from client");
            });
        });
        io.listen(8080);
        /*
        const httpServer = require("http").createServer();
        this.SocketIo = require('socket.io')(httpServer, {});

        this.SocketIo.on("connection", (socket) => {
            console.log("connected");
            socket.emit("S2C_connection_OK", "MESSAGE");
            socket.on("C2S_play", (data) => {
                console.log(data);
                socket.emit("S2C_play_OK", null);
            });
            socket.on("C2S_stop", (data) => {
                console.log(data); socket.emit("S2C_stop_OK", null);
            });
        });
        httpServer.listen(80, () => console.log("PORT 8080 START"));
        */
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
    private async GetGhStatus(): Promise<void> {
        for (let key in this.GHomes) {
            console.log(key);
            await this.GHomes[key].g.GetStatus().then(console.log);
            await this.GHomes[key].g.GetSessions().then(console.log);
            await this.GHomes[key].g.GetPalyerStatus().then(console.log);
        }
    }

    //static count: number = 0;
    private async Monitoring(){
        //MainMonitor.count++;

        this.CreateOrOverWriteObjects();

        try {
            await this.GetGhStatus();

            /*
            if (MainMonitor.count == 10) {
                this.GetGhObjByName("青色グーグル")?.g?.PlayList(['http://192.168.1.200/g_dlfile/2022-05-08_11-45-37_109.wav']);
            }
            */
        } catch (err) {
            console.log("ERR DETECTED");
            console.error(err);
        }
    }
}

const Monitor = new GHomeMonitor();
Monitor.Start();
