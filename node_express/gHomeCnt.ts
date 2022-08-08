import { globalVars, getLocalAddress } from './variables';
import path = require('path');


interface IGoogleHomeSeekResults {
    address: string;
    friendlyName: string;
    speakerName: string;
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
                //const browser = bonjour.find({ type: 'http' },
                function (service) {
                    //console.log(service);
                    return_val.push(
                        //{ address: s.addresses[0], friendlyName: s.txt.fn }
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
    /*
    public static seekGoogleHomes(arg0: number, arg1: number): IGoogleHomeSeekResults[] | PromiseLike<IGoogleHomeSeekResults[]> {
        throw new Error('Function not implemented.');
    }
    */

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
        if (!this.IsConnected) {
            console.log("CONNECTION");
            this.ConnectedCient = new this.Client();
            this.IsConnected = true;
            this.ConnectedCient.on('error',  (err) => {
                this.IsConnected = false;
                console.log('Error: %s', err.message);
                this.Disconnect();
            });
            this.IsConnected = true;
            return new Promise<void>((resolve, reject) => {
                this.ConnectedCient.connect({ host: this.SelfStatus.address }, function () {
                    console.log("connected");
                    resolve();
                });
            });
        }
    }

    public GetVolume() {
        try {
            this.ConnectedCient.getVolume( (err, vol) => {
                if (err) {
                    this.Disconnect();
                }
            });
        } catch (e) {
            console.log(e);
            this.Disconnect();
        }
    }

    public GetStatus() {
        try {
            this.ConnectedCient.getStatus( (err, stat) => {
                if (err) {
                    this.Disconnect();
                }
            });
        } catch (e) {
            console.log(e);
            this.Disconnect();
        }
    }

    public GetSessions() {
        try {
            this.ConnectedCient.getSessions( (err, sessions) => {
                if (err) {
                    this.Disconnect();
                }
                this.Sessions = sessions;
            });
        } catch (e) {
            console.log(e);
            this.Disconnect();
        }
    }

    public async Launch(): Promise<void> {
        await this.Connect();

        if (this.IsLaunched) return Promise.resolve();

        return new Promise<void>((resolve, reject) => {
            this.ConnectedCient.launch(this.DefaultMediaReceiver, (err, player) => {
                player.on('status', (status) => {
                    console.log('status broadcast playerState=%s', status.playerState);
                    console.log('status=', status);
                    this.Player = player;
                    resolve();
                });
                this.Player = player;
                this.IsLaunched = true;
                if (err) {
                    console.log(err);
                    this.Disconnect();
                    this.IsLaunched = false;
                    reject();
                }
            });
        });
    }

    public async PlayUrl(playUrl: string) {

        if (!this.IsLaunched) await this.Launch();

        var media = {
            contentId: playUrl,
            contentType: GoogleHomeController.getProperContentType(playUrl),
            streamType: 'BUFFERED', // or LIVE

            metadata: {
                type: 0,
                metadataType: 0,
                title: "Big Buck Bunny",
                images: [
                    { url: playUrl}
                ]
            }
        };

        this.Player.load(media, { autoplay: true, currentTime: 0 }, (err, status)=> {
            if (status?.playerState) {
                console.log('media loaded playerState=%s', status.playerState);
            } else {
                console.log('media loaded playerState=NULL_OR_UNDEF');
            }
            if (err) {
                console.log(err);
                this.Disconnect();
            }
        });
    }

    public async PlayList(playUrlList: string[]) {

        await this.Launch();

        let items: any[] = [];
        playUrlList.forEach(playUrl => {
            let media =
            {
                contentId: playUrl,
                contentType: GoogleHomeController.getProperContentType(playUrl),
                streamType: 'BUFFERED', // or LIVE
                metadata: {
                    type: 0,
                    metadataType: 0,
                    title: "Big Buck Bunny",
                    images: [
                        { url: playUrl }
                    ]
                }
            }
            items.push({
                media: media
            });
        });

        this.Player.queueLoad(items, { autoplay: true, repeatMode: 'REPEAT_ALL'}, (err, status) => {
            if (status?.playerState) {
                console.log('media loaded playerState=%s', status.playerState);
            } else {
                console.log('media loaded playerState=NULL_OR_UNDEF');
            }
            if (err) {
                console.log(err);
                this.Disconnect();
            }
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
        console.log("DISCONNET");
        this.IsConnected = false;
        this.IsLaunched = false;
        this.Player = null;
        this.ConnectedCient.close();
    }


    public sample_play_func(host) {
        const client = new this.Client();

        client.connect({ host: host },  () => {
            console.log('connected, launching app ...');

            client.launch(this.DefaultMediaReceiver, function (err, player) {
                var media = {

                    // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                    contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
                    //contentType: 'audio/mp3',
                    contentType: 'video/mp4',
                    streamType: 'BUFFERED', // or LIVE

                    // Title and cover displayed while buffering
                    metadata: {
                        type: 0,
                        metadataType: 0,
                        title: "Big Buck Bunny",
                        images: [
                            { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                        ]
                    }
                };

                player.on('status', function (status) {
                    console.log('status broadcast playerState=%s', status.playerState);
                });

                console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

                player.load(media, { autoplay: true }, function (err, status) {
                    console.log('media loaded playerState=%s', status.playerState);

                    /*
                    // Seek to 2 minutes after 15 seconds playing.
                    setTimeout(function () {
                        player.seek(2 * 60, function (err, status) {
                            //
                        });
                    }, 15000);
                    */
                });

            });

        });

        client.on('error', function (err) {
            console.log('Error: %s', err.message);
            client.close();
        });

    }
}
