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

interface Imedia2 {
    media: Imedia;
}

export class GoogleHomeController {
    static bonjour = require('bonjour')();
    private Client = require('castv2-client').Client; // class
    private DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

    static gHomeAddresses: IGoogleHomeSeekResults[];
    static gHomeSeekFlag_timeout: NodeJS.Timeout | null = null;
    static secondsCount: number = 0;

    public SelfStatus: IGoogleHomeSeekResults;
    private ConnectedClient;
    private IsConnected: boolean = false;
    public Sessions: any[] = [];

    private StatsAll: any = null;

    private Vol: any = null;
    private Status: any = null
    private PlayerStatus: any = null;

    static InitializedFlag: boolean = false;

    GetVol = () => this.Vol;
    GetStatus = () => this.Status;
    GetPlayerStatus = () => this.PlayerStatus;

    GetAllStatus() {
        return this.StatsAll;
    }

    constructor() {

    }
    Fnalize(): void {
        //throw new Error('Method not implemented.');
    }

    public static init() {
        if (!this.InitializedFlag) {
            GoogleHomeController.gHomeAddresses = [];
            require('castv2-client').Client.prototype.getSpecial = function (callback) {
                this.getStatus(function (err, status) {
                    if (err) return callback(err);
                    callback(null, status);
                });
            };
        }
        this.InitializedFlag = true;
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

    public static async seekGoogleHomes(timeout: number, repeatType: number): Promise<IGoogleHomeSeekResults[]> {

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
        if (this.IsConnected) return;
        else return new Promise<void>((resolve, reject) => {
            this.ConnectedClient = new this.Client();
            this.ConnectedClient.on('error', (err) => {
                this.Disconnect();
            });
            this.ConnectedClient.connect({ host: this.SelfStatus.address }, () => {
                this.IsConnected = true;
                resolve();
            });
        });
    }

    /*
    public async Launch(): Promise<any> {
        await this.Connect();
        if (this.IsLaunched) return;
        else return new Promise<any>((resolve, reject) => {
            this.ConnectedClient.launch(this.DefaultMediaReceiver, (err, player) => {
                if (err) {
                    this.Disconnect();
                    reject(err);
                } else {
                    this.IsLaunched = true;
                    resolve("launched!");
                }

                player.on('status', (status) => {
                    console.log('status broadcast playerState=%s', status.playerState);
                });
            });
        });
    }
    */

    public async UpdateStatsAll(): Promise<any> {
        await this.Connect();
        return new Promise((resolve, reject) => {
            this.ConnectedClient.getSpecial((err, stat) => {
                if (err) {
                    this.Disconnect();
                    reject(null)
                } else {
                    this.StatsAll = stat;
                    resolve(this.StatsAll);
                }
            });
        });
    }


    public async SetVolume(vol: number): Promise<void> {
        await this.Connect();
        return new Promise((resolve, reject) => {
            this.ConnectedClient.setVolume(
                {
                    muted: false,
                    level: vol / 100,
                }, (err, response) => {
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

    public async UpdateStatus() {
        await this.Connect();
        return new Promise<any>((resolve, reject) => {
            this.ConnectedClient.getStatus((err, stat) => {
                if (err) {
                    this.Disconnect();
                    reject(err)
                } else {
                    this.Status = stat;
                    resolve(stat);
                }
            });
        });
    }

    /*
    public async UpdateSessions() {
        await this.Connect();
        return new Promise<any>((resolve, reject) => {
            this.ConnectedClient.getSessions((err, sessions) => {
                if (err) {
                    this.Disconnect();
                    reject(err);
                } else {
                    resolve(sessions);
                }
            });
        });
    }
    */

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

    private BuildMediaData2(media_info: Imedia_info | string): Imedia2 {
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
            media: {
                contentId: media_info_temp.playUrl,
                contentType: media_info_temp.contentType ?? GoogleHomeController.getProperContentType(media_info_temp.playUrl),
                streamType: 'BUFFERED', // or LIVE

                metadata: {
                    type: 0,
                    metadataType: 0,
                    title: media_info_temp.title ?? 'No Title',
                }
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

        let items: Imedia2[] = media_info_list.map(media_info => this.BuildMediaData2(media_info));
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

    public async UpdatePlayerStatus(): Promise<object | null> {
        await this.Launch();
        return new Promise((resolve, reject) => {
            this.Player?.getStatus((err, status) => {
                if (err) {
                    this.PlayerStatus = null;
                    reject(err);
                }
                else {
                    this.PlayerStatus = status;
                    resolve(status);
                }
            });
        });
    }

    public async GetAppInfo() {
        await this.Launch();

        this.Sessions.map(s => s.appId).forEach(apid => {
            this.ConnectedClient.getAppAvailability(apid, (err, AppInfo) => {
                //console.log(apid);
                //console.log(AppInfo);
            });
        });
    }

    public Disconnect() {
        console.log("DISCONNECT");
        this.IsConnected = false;
        this.IsLaunched = false;
        this.Status = null;
        this.Vol = null;
        this.Player = null;
        this.ConnectedClient?.close();
        this.ConnectedClient = null;
    }

}
