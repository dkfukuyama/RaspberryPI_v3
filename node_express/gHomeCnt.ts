import { globalVars, getLocalAddress } from './variables';
import path = require('path');


interface IGoogleHomeSeekResults {
    address: string;
    friendlyName: string;
    speakerName: string;
}

interface Imedia_info {
    playUrl: string;
    contentType: string | null;
    title: string | null
}

interface Imedia {
    contentId: string;
    contentType: string;
    streamType: string;
    metadata: any;
}


export class GoogleHomeController {
    static bonjour = require('bonjour')();
    Client = require('castv2-client').Client; // class
    DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

    static gHomeAddresses: IGoogleHomeSeekResults[];
    static gHomeSeekFlag_timeout: NodeJS.Timeout | null = null;
    static secondsCount: number = 0;

    public SelfStatus: IGoogleHomeSeekResults;
    private ConnectedCient;
    private IsConnected: boolean = false;
    private IsLaunched: boolean = false;
    public Player: any | null = null;
    public Sessions: any[] = [];

    constructor() {

    }
    Fnalize(): void {
        //throw new Error('Method not implemented.');
    }

    public static init() {
        GoogleHomeController.gHomeAddresses = [];
    }

    public static getGoogleHomeAddresses(): IGoogleHomeSeekResults[] {
        return GoogleHomeController.gHomeAddresses;
    }

    public static getGHAddrFromName(speakerName: string): string[] {
        let returnval: string[] = [];
        GoogleHomeController.gHomeAddresses.forEach((a) => {
            if (a.speakerName == speakerName) {
                returnval.push(a.address);
            }
        });
        return returnval;
    }

    public static startSeekGoogleLoop() {
        GoogleHomeController.stopSeekGoogleLoop();
        GoogleHomeController.gHomeSeekFlag_timeout = setInterval(async () => {
            if (GoogleHomeController.secondsCount == 0) {
                let temp = await GoogleHomeController.seekGoogleHomes(3000, 0);
                GoogleHomeController.gHomeAddresses = temp;
            }
            if (GoogleHomeController.gHomeAddresses?.length) {
                GoogleHomeController.secondsCount = (GoogleHomeController.secondsCount + 1) % 10;
            }
            else {
                GoogleHomeController.secondsCount = (GoogleHomeController.secondsCount + 1) % 4;
            }
        }, 1000);
    }

    public static stopSeekGoogleLoop() {
        if (GoogleHomeController.gHomeSeekFlag_timeout) {
            clearInterval(GoogleHomeController.gHomeSeekFlag_timeout);
        }
    }

    public static async seekGoogleHomes(timeout: number, repeatType): Promise<IGoogleHomeSeekResults[]> {

        return new Promise((resolve, _) => {
            let return_val: IGoogleHomeSeekResults[] = [];
            const browser = GoogleHomeController.bonjour.find({ type: 'googlecast' },
                function (service) {
                    return_val.push(
                        { address: service.addresses[0], friendlyName: service.name, speakerName: service?.txt?.fn ?? '' }
                    );
                });
            return_val.sort();
            setTimeout(() => {
                browser.stop();

                resolve(return_val);
            }, timeout);
        });
    }

    public static getProperContentType(url) {
        let extType = url.substr(-4);
        const contentTypes = {
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.mp4': 'video/mp4',
        };
        return contentTypes[extType];
    }

    public async Connect(): Promise<void> {
        console.log(this.SelfStatus.speakerName);
        return new Promise<void>((resolve, reject) => {
            if (this.IsConnected) return Promise.resolve();
            else this.ConnectedCient = new this.Client();
            this.ConnectedCient.on('error', (err) => {
                this.Disconnect();
            });
            this.ConnectedCient.connect({ host: this.SelfStatus.address }, () => {
                console.log(`connected to ${this.SelfStatus.speakerName}`);
                this.IsConnected = true;
                resolve();
            });
        });
    }

    public async Launch(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            await this.Connect();
            if (this.IsLaunched) return Promise.resolve();
            else this.ConnectedCient.launch(this.DefaultMediaReceiver, (err, player) => {
                player.on('status', (status) => {
                    console.log('status broadcast playerState=%s', status.playerState);
                    console.log('status=', status);
                    this.Player = player;
                    this.IsLaunched = true;
                    resolve();
                });
                if (err) {
                    this.Disconnect();
                    reject(err);
                }
                console.log("launched!");
            });
        });
    }

    public async GetVolume(): Promise<number|null> {
        await this.Launch();
        return new Promise((resolve, reject) => {
            this.ConnectedCient.getVolume((err, vol) => {
                if (err) {
                    this.Disconnect();
                    reject(null)
                } else {
                    resolve(vol);
                }
            });
        });
    }

    public async SetVolume(vol: number): Promise<void> {
        await this.Launch();
        return new Promise((resolve, reject) => {
            this.ConnectedCient.setVolume(
                {
                    muted: false,
                    level: vol / 100,
                }, (err) => {
                    if (err) {
                        this.Disconnect()
                        reject();
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    public async GetStatus() {
        await this.Launch();
        return new Promise<any>((resolve, reject) => {
            this.ConnectedCient.getStatus((err, stat) => {
                if (err) {
                    this.Disconnect();
                    reject(err)
                } else {
                    resolve(stat);
                }
            });
        });
    }

    public async GetSessions() {
        await this.Launch();
        return new Promise<any>((resolve, reject) => {
            this.ConnectedCient.getSessions((err, sessions) => {
                if (err) {
                    this.Disconnect();
                    reject(err);
                } else {
                    resolve(sessions);
                }
            });
        });
    }

    private BuildMediaData(media_info: Imedia_info | string): Imedia {
        let media_info_temp: Imedia_info;

        if (typeof (media_info) == "string") {
            media_info_temp = {
                playUrl: media_info,
                contentType: null,
                title: null
            }
        } else {
            media_info_temp = media_info;
        }

        return {
            contentId: media_info_temp.playUrl,
            contentType: media_info_temp.contentType ?? GoogleHomeController.getProperContentType(media_info_temp.playUrl),
            streamType: 'BUFFERED', // or LIVE

            metadata: {
                type: 0,
                metadataType: 0,
                title: media_info_temp.title ?? 'No Title',
            }
        };
    }

    public async PlayUrl(media_info: Imedia_info | string): Promise<void> {
        await this.Launch();

        let media = this.BuildMediaData(media_info);
        return new Promise<void>((resolve, reject) => {
            this.Player.load(media, { autoplay: true, currentTime: 0 }, (err, status) => {
                if (status?.playerState) {
                    console.log('media loaded playerState=%s', status.playerState);
                } else {
                    console.log('media loaded playerState=NULL_OR_UNDEF');
                }
                if (err) {
                    this.Disconnect();
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async PlayList(media_info_list: (Imedia_info | string)[]): Promise<void> {
        await this.Launch();

        let items: Imedia[] = media_info_list.map(media_info => this.BuildMediaData(media_info));
        return new Promise<void>((resolve, reject) => {
            this.Player.queueLoad(items, { autoplay: true, repeatMode: 'REPEAT_ALL' }, (err, status) => {
                if (status?.playerState) {
                    console.log('media loaded playerState=%s', status.playerState);
                } else {
                    console.log('media loaded playerState=NULL_OR_UNDEF');
                }
                if (err) {
                    this.Disconnect();
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public GetAppInfo() {
        this.Sessions.map(s => s.appId).forEach(apid => {
            this.ConnectedCient.getAppAvailability(apid, (err, AppInfo) => {
                console.log(apid);
                console.log(AppInfo);
            });
        });
    }

    public Disconnect() {
        console.log("DISCONNECT");
        this.IsConnected = false;
        this.IsLaunched = false;
        this.Player = null;
        this.ConnectedCient?.close();
        this.ConnectedCient = null;
    }

}
