import path = require('path');

import { delay_ms, clearEventEmitter } from '@/UtilFunctions';

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

    private readonly DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
    private readonly PlatformSender = require('castv2-client').PlatformSender;

    static gHomeAddresses: IGoogleHomeSeekResults[];
    static gHomeSeekFlag_timeout: NodeJS.Timeout | null = null;
    static secondsCount: number = 0;

    public SelfStatus: IGoogleHomeSeekResults;

    static InitializedFlag: boolean = false;


    private PfSender = new this.PlatformSender();
    private JoinedAppId: string | null = null;
    private MediaPlayer = null;

    private IpAddress: string = "";
    private ConnectionRetryIntervalMs: number = 100;



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

    public GetAllStatus() {

    }

    public async Launch(): Promise<any> {
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
            this.MediaPlayer.load(media, { autoplay: true, currentTime: 0 }, (err, status) => {
                if (status?.playerState) {
                    console.log('media loaded playerState=%s', status.playerState);
                } else {
                    console.log('media loaded playerState=NULL_OR_UNDEF');
                }
                if (err) {
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
            this.MediaPlayer.queueLoad(items, { autoplay: true, repeatMode: 'REPEAT_ALL' }, (err, status) => {
                if (status?.playerState) {
                    console.log('media loaded playerState=%s', status.playerState);
                } else {
                    console.log('media loaded playerState=NULL_OR_UNDEF');
                }
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    private Media_onStatus(status) {
        console.log("Media_onStatus");
        console.log(status);
    };

    private InitMediaPlayer(): void {
        clearEventEmitter(this.MediaPlayer); this.MediaPlayer = null;
    }

    constructor(_ipAddress: string, _connectionRetryIntervalMs?: number) {
        this.IpAddress = _ipAddress;
        this.ConnectionRetryIntervalMs = _connectionRetryIntervalMs ?? this.ConnectionRetryIntervalMs;

        this.PfSender.on('error', async (data) => {
            console.log("ON ERROR");
            console.log({ data });
            this.PfSender.close();
        });

        this.PfSender.on('status', (status) => this.onStatus(status));

        this.PfSender.on('error', async (data) => {
            console.log("ON ERROR");
            console.log({ data });
            //ps.close();
            if (this.ConnectionRetryIntervalMs > 0) {
                await delay_ms(this.ConnectionRetryIntervalMs);
                this.Connect();
            }
        });
    }

    private onStatus(status) {
        console.log({ status });
        let app = (status.applications || []);

        if (app.length > 0) {
            if ((this.JoinedAppId && this.JoinedAppId != app[0].appId) || !this.JoinedAppId) {
                this.InitMediaPlayer();

                this.PfSender.join(app[0], this.DefaultMediaReceiver, (err, player) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    player.on('status', (status) => this.Media_onStatus(status));
                    this.MediaPlayer = player;
                    this.JoinedAppId = app[0].appId;

                    player.getStatus((err, status) => {
                        if (err) {
                            console.log(err);
                        } else this.Media_onStatus(status);
                    });
                });
            }
        } else {
            this.InitMediaPlayer();
            this.JoinedAppId = null;
        }
    }

    public Connect(): void {
        this.PfSender.connect(this.IpAddress, () => {
            this.PfSender.getStatus((err, status) => {
                if (err) {
                    console.error(err);
                    return;
                } else this.onStatus(status);
            });
        });
    }

    public Finalize(): void {

    }
}
