import { GoogleHomeController } from '../gHomeCnt';
import { addMinutes, addSeconds } from 'date-fns';


export class MainMonitor {
    GHomes: {
        [Key: string]: {
            g: GoogleHomeController;
            lastUpdated: Date;
        }
    };

    private MonitoringLoopInt: NodeJS.Timeout | null = null;
    constructor() {
        GoogleHomeController.init();
        this.GHomes = {};
    }
    public Start() {
        GoogleHomeController.startSeekGoogleLoop();
        setInterval(() => {
            this.Monitoring();
        }, 999);
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
            await this.GHomes[key].g.Connect();
            await this.GHomes[key].g.Launch();
            this.GHomes[key].g.GetStatus();
            this.GHomes[key].g.GetSessions();
        }
    }

    static count: number = 0;
    private Monitoring(){
        MainMonitor.count++;

        this.CreateOrOverWriteObjects();
        this.GetGhStatus();

        if (this.GetGhObjByName("青色グーグル")) {
            console.log("STAT STAT STAT");
            this.GetGhObjByName("青色グーグル").g.Player?.getStatus((a, b) => console.log([a, b]));
            if (MainMonitor.count == 10) {
                this.GetGhObjByName("青色グーグル").g.PlayList([
                    'http://192.168.1.200/g_dlfile/2022-05-08_11-45-37_109.wav',
                    'http://192.168.1.200/g_dlfile/2022-05-10_20-36-59_487.wav'
                ]);
            }
        }
       
    }
}

const Monitor = new MainMonitor();
Monitor.Start();
