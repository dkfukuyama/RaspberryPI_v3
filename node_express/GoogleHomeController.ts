import path = require('path');
import { delay_ms, clearEventEmitter, __LINE__ } from '@/UtilFunctions';
import { IAppFunctionArgs } from './AppFunctions';
import { Socket } from 'socket.io';

export interface IGoogleHomeSeekResults {
    address: string;
    friendlyName: string;
    speakerName: string;
}

export interface ISendMusicCommand {
	addr: string;
	title?: string;
	dir?: string;
	filePath?: string;
}

export interface Imedia_info {
	playUrl?: string;
	filePath?: string;
	ext?: string;	
	contentType?: string;
	title?: string
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


export type EPlayOptionIdName = "RepeatMode" | "PlayOrder" | "SoxEffectsPreset";
export type EPlayOptionShowName = "くりかえし" | "じゅんばん" | "とくしゅこうか";

export type ERepeatMode = "REPEAT_OFF" | "REPEAT_ALL" | "REPEAT_SINGLE" | "REPEAT_ALL_AND_SHUFFLE";
export type EPlayOrder = "INTERRUPT" | "CLEAR_OTHERS" | "ADD_AFTER_PLAYING" | "ADD_FIRST" | "ADD_LAST";
export type ESoxEffectsPresetKey = "None" | "Yamabiko" | "Reverb" | "Robot" | "Kimoi" | "Random";

export interface IPlayOption {
	RepeatMode?: ERepeatMode;
	PlayOrder?: EPlayOrder;
};

export interface IPlayOptionSelectorHtmlElement {
	Value: string;
	ShowName: string;
	command?: string;
	command_replace?: string;
}
interface IPlayOptionSelectorHtmlElement_X_RE extends IPlayOptionSelectorHtmlElement {
	Value: ERepeatMode;
}
interface IPlayOptionSelectorHtmlElement_X_SOX extends IPlayOptionSelectorHtmlElement {
	Value: ESoxEffectsPresetKey;
}
type IPlayOptionSelectorHtml = {
	[index in EPlayOptionIdName]: IPlayOptionSelectorHtmlElement[];
};

export interface IPlayOptionSelectorHtmlExt extends IPlayOptionSelectorHtml {
	'RepeatMode': IPlayOptionSelectorHtmlElement_X_RE[];
	'PlayOrder': IPlayOptionSelectorHtmlElement[];
	'SoxEffectsPreset': IPlayOptionSelectorHtmlElement_X_SOX[];
};


export class PlayOptionSelector {
	public static readonly Parameters: IPlayOptionSelectorHtmlExt = {
		'RepeatMode': [
			{ Value: 'REPEAT_OFF', ShowName: 'リピートなし', },
			{ Value: 'REPEAT_SINGLE', ShowName: '1曲リピート', },
			{ Value: 'REPEAT_ALL', ShowName: '全曲リピート', },
			{ Value: 'REPEAT_ALL_AND_SHUFFLE', ShowName: 'ランダムリピート', },
		],
		'PlayOrder': [
			{ Value: 'CLEAR_OTHERS', ShowName: 'すぐに再生', },
			{ Value: 'INTERRUPT', ShowName: '割り込み再生', },
			{ Value: 'ADD_AFTER_PLAYING', ShowName: 'この後に再生', },
			{ Value: 'ADD_FIRST', ShowName: '最初に追加', },
			{ Value: 'ADD_LAST', ShowName: '最後に追加', },
		],
		'SoxEffectsPreset': [
			{ Value: "None", ShowName: "なし", command: "" },
			{ Value: "Yamabiko", ShowName: "やまびこ", command: "echo 0.8 0.9 400 0.3 800 0.25 1200 0.1 1600 0.05" },
			{ Value: "Reverb", ShowName: "リバーブ", command: "reverb" },
			{ Value: "Robot", ShowName: "ロボット", command: "echo 0.5 0.8 30 1 echo 0.5 0.8 13 1 echo 0.8 0.9 13 1 echo 0.8 0.8 13 1 gain -e -5" },
			{
				Value: "Kimoi",
				ShowName: "きもい",
				command: `-m -t sox "|sox REPLACE pitch -190 echo 0.8 0.9 50 0.5" -t sox "|sox REPLACE pitch 270 echo 0.8 0.9 60 0.8" -t wav -`,
				command_replace: "REPLACE",
			},
			{ Value: "Random", ShowName: "らんだむ", command: "" },
		],
	}
	public static GenHtml(className: EPlayOptionIdName, title: EPlayOptionShowName): string {
		let return_value: string = `<label for="${className}">${title}</label><select class="${className}">`;
		const r = PlayOptionSelector.Parameters[className];
		for (let i: number = 0; i < r.length; i++) {
			return_value += `<option value="${r[i].Value}">${r[i].ShowName}</option>`
		}
		return_value += "</select>";
		return return_value;
	}
}

export interface ISoxConfig {
	sox?: boolean;
	pitch: number;
	tempo: number;
	effectsString?: string;
	effectsPreset?: ESoxEffectsPresetKey;
};

export interface IAppFunctionArgs_PlayMusicData {
	SpeakerAddress: string;
	Media: Imedia_info[];
	PlayOption?: IPlayOption;
	SoxConfig?: ISoxConfig[];
}

export interface IAppFunctionArgs_PlayMusic extends IAppFunctionArgs {
	data: IAppFunctionArgs_PlayMusicData
}

export interface IAppFunctionArgs_GHomeCntData {
	SpeakerAddress: string;
	Volume_0_100: number;
}

export interface IAppFunctionArgs_GHomeCnt extends IAppFunctionArgs {
	data: IAppFunctionArgs_GHomeCntData
}



export class GoogleHomeController {
    static bonjour = require('bonjour')();

    private readonly DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
    private readonly PlatformSender = require('castv2-client').PlatformSender;

    static gHomeAddresses: IGoogleHomeSeekResults[];
    static gHomeSeekFlag_timeout: NodeJS.Timeout | null = null;
    static secondsCount: number = 0;

	public UrlBaseString: string = "";
    public SelfStatus: IGoogleHomeSeekResults;

    public Status: any;
    public PlayerStatus: any;

	public UpdateSocketList: { [i: string]: Socket } = {};

    static InitializedFlag: boolean = false;

    private PfSender = new this.PlatformSender();
    private JoinedAppId: string | null = null;
    private MediaPlayer = null;

    private IpAddress: string = "";
    private ConnectionRetryIntervalMs: number = 100;
	static Sox: string = 'sox';
    Interval_t: NodeJS.Timeout | null = null;

    public static init() {
        if (!this.InitializedFlag) {
            GoogleHomeController.gHomeAddresses = [];
            let p = require('castv2-client').PlatformSender;
            p.prototype.close = function () {
                this.client?.socket?.end();
                this.client?.socket?.destroy();
            }
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

	private static readonly contentTypes = {
		'.wav': 'audio/wav',
		'.mp3': 'audio/mpeg',
		'.mp4': 'video/mp4',
		'.wma': 'audio/x-ms-wma',
	};

    public static getProperContentType(url: string) {
        let extType = url.substr(-4);
        return GoogleHomeController.contentTypes[extType];
	}
	public static getAveilableExtentions(): string[] {
		return Object.keys(GoogleHomeController.contentTypes);
	}

	public static getTitleName(url) {
		return path.basename(url);
	}

	static BuildSoxCommand(filepath: string, sox: ISoxConfig): string {
		const T_WAV: string = ` -t wav -`;
		const T_SOX: string = ` -t sox -`;

		let ret: string = `"${filepath}"`;
		ret += T_WAV
		if (sox.pitch) ret += ` pitch ${Math.floor(sox.pitch)}`;
		if (sox.tempo) ret += ` tempo ${sox.tempo}`;

		if (sox.effectsPreset && sox.effectsPreset != 'None')
		{
			let x: IPlayOptionSelectorHtmlElement_X_SOX | null = null;
			const ar = PlayOptionSelector.Parameters['SoxEffectsPreset'].filter(a => a.Value != 'None' && a.Value != 'Random');
			if (sox.effectsPreset != 'Random') {
				x = ar.filter(a => a.Value == sox.effectsPreset)[0];
			} else {
				x = ar[Math.floor(Math.random() * ar.length)];
			}
			if (x.command_replace) {
				ret = ret.replace(T_WAV, T_SOX);
				ret = ret.replace(new RegExp('"', 'g'), '""');
				ret = x.command.replace(new RegExp(x.command_replace, 'g'), ret);
			} else {
				ret += ` ${x.command}`;
			}
		}
		return `${this.Sox} ${ret}`;
	}

	static SoxConfInitial(): ISoxConfig {
		return {
			sox: true,
			pitch: 0,
			tempo: 1,
			effectsPreset: 'None',
			effectsString: '',
		}
	}

	static SoxConfUrlEncode(sox: ISoxConfig): string {
		if (GoogleHomeController.IsSoxDefaultValue(sox)) {
			return "";
		} else {
			sox.sox = true;
			if (sox.effectsPreset == 'None' || !sox.effectsPreset) delete sox.effectsPreset;
			const keys = Object.keys(sox);
			return '?' + keys.sort().map(k => `${k}=${sox[k]}`).join('&');
		}
	}

	static IsSoxDefaultValue(sox: ISoxConfig): boolean {
		var sox_ini = GoogleHomeController.SoxConfInitial();
		if (!sox.effectsPreset) sox.effectsPreset = 'None';
		const keys = Object.keys(sox_ini);
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (k == 'sox') continue;
			if (sox_ini[k] != (sox[k] ?? "")){
				return false;
			}
		}
		return true;
	}

	static SoxConfUrlDecode(inp: object): ISoxConfig {
		let return_val: ISoxConfig = GoogleHomeController.SoxConfInitial();
		var keys_i = Object.keys(inp);
		var keys_s = Object.keys(return_val);
		keys_i.forEach(k => {
			if (inp[k] && keys_s.includes(k)) {
				return_val[k] = inp[k];
			}
		})
		return return_val;
	}

	static ConcatSoxConfUrlAr(items: Imedia2[], Sox?: ISoxConfig[]): Imedia2[] {
		if (Sox?.length == items.length) {
			for (let i = 0; i < items.length; i++) {
				items[i].media.contentId += GoogleHomeController.SoxConfUrlEncode(Sox[i]);
			}
		} 
		return items;
	}

    public GetAllStatus(): { Self: IGoogleHomeSeekResults, Status: any, PlayerStatus: any } {
        return {
            Self: this.SelfStatus,
            Status: this.Status,
            PlayerStatus: this.PlayerStatus ?? {},
        }
    }
    
	private BuildMediaData(media_info: Imedia_info | string ): Imedia {
		let media_info_temp: Imedia_info;

		if (typeof (media_info) != 'string') {
			media_info_temp = media_info;
			if (!media_info_temp.playUrl && media_info_temp.filePath) {
				media_info_temp.playUrl = media_info_temp.filePath;
			}
			media_info_temp.contentType = GoogleHomeController.getProperContentType(media_info_temp.playUrl);
		}
		else {
			media_info_temp = {
				playUrl: media_info,
				contentType: GoogleHomeController.getProperContentType(media_info),
				title: GoogleHomeController.getTitleName(media_info),
			}
		}

		const slash: string = '/';
		if (!media_info_temp.playUrl.startsWith(this.UrlBaseString)) {
			if (this.UrlBaseString.endsWith(slash)) this.UrlBaseString = this.UrlBaseString.substring(0, this.UrlBaseString.length - 1);
			if (media_info_temp.playUrl.startsWith(slash)) media_info_temp.playUrl = media_info_temp.playUrl.substring(1, media_info_temp.playUrl.length - 1);
			media_info_temp.playUrl = this.UrlBaseString + slash + media_info_temp.playUrl;
		};

        const return_val = {
            contentId: media_info_temp.playUrl,
            contentType: media_info_temp.contentType ?? GoogleHomeController.getProperContentType(media_info_temp.playUrl),
            streamType: 'BUFFERED', // or LIVE

            metadata: {
                type: 0,
                metadataType: 0,
                title: media_info_temp.title ?? 'No Title',
            }
		};
		console.log({ return_val });
		return return_val;
    }

	private BuildMediaData2(media_info: Imedia_info | string): Imedia2 {
        return {
            media: this.BuildMediaData(media_info),
        }

    }

	public async PlayUrl(media_info: Imedia_info | string): Promise<void> {

        let media = this.BuildMediaData(media_info);

        const client = new (require('castv2-client').Client)();
        client.connect(this.SelfStatus.address, () => {
            client.launch(this.DefaultMediaReceiver, (err, player)=> {
                player.load(media, { autoplay: true }, function (err, status) { });
            });

        });
        client.once('error', function (err) {
            console.log('Error: %s', err.message);
            client.close();
            clearEventEmitter(client);
        });

        setTimeout(() => {
            client.close();
            clearEventEmitter(client);
        }, 10000);
    }

	public async PlayList(media_info_list: (Imedia_info | string)[], Sox: ISoxConfig[] | null, playOption: IPlayOption): Promise<void> {

		console.log({ media_info_list });
		console.log({ playOption });
		/*
			"RepeatMode": "REPEAT_OFF",
			"PlayOrder": "CLEAR_OTHERS"
		*/

        let items: Imedia2[] = media_info_list.map(media_info => this.BuildMediaData2(media_info));
		items = GoogleHomeController.ConcatSoxConfUrlAr(items, Sox);

		/*
		let prm = new Promise<void>((resolve, reject) => {
			let app = (this.Status.applications || []);
			if ((this.JoinedAppId && this.JoinedAppId != app[0].appId) || !this.JoinedAppId) {
				this.InitMediaPlayer();
				this.PfSender.launch(this.DefaultMediaReceiver, (err, player) =>
				{
					if (err) {
						console.error(err);
						return;
					}
					player.on('status', (status) => this.Media_onStatus(status));
					this.MediaPlayer = player;
					this.JoinedAppId = this.DefaultMediaReceiver.appId;

					player.getStatus((err, status) => {
						if (err) {
							reject(err);
						} else this.Media_onStatus(status);
					});

					resolve();
				});
			} else {
				this.PfSender.join(app[0], this.DefaultMediaReceiver, (err, player) =>
				{
					if (err) {
						console.error(err);
						return;
					}
					player.on('status', (status) => this.Media_onStatus(status));
					this.MediaPlayer = player;
					this.JoinedAppId = app[0].appId;

					player.getStatus((err, status) => {
						if (err) {
							reject(err);
						} else this.Media_onStatus(status);
					});

					resolve();
				});
			}
		}).then(() =>
		{
			switch (playOption.PlayOrder) {
				case 'ADD_AFTER_PLAYING':
					this.MediaPlayer.queueInsert(
						items, { autoplay: true, repeatMode: playOption.RepeatMode },
						(err, status) => {
							if (err) throw err;
							else return status;
						}
					);

					break;
				case 'CLEAR_OTHERS':
					this.MediaPlayer.queueLoad(
						items, { autoplay: true, repeatMode: playOption.RepeatMode },
						(err, status) => {
							if (err) throw err;
							else return status;
						}
					);

					this.MediaPlayer.queueLoad(
						items, { autoplay: true, repeatMode: playOption.RepeatMode },
						(err, status) => {
							if (err) throw err;
							else return status;
						}
					);
					break;
				default:
					this.MediaPlayer.queueLoad(
						items, { autoplay: true, repeatMode: playOption.RepeatMode },
						(err, status) => {
							if (err) throw err;
							else return status;
						}
					);
			}
		})
		.catch(err => console.error(err));
		let res = await prm;
		*/

		const client = new (require('castv2-client').Client)();
        client.connect(this.SelfStatus.address, () => {
			client.launch(this.DefaultMediaReceiver, (err, player) => {
				player.queueLoad(items, { autoplay: true, repeatMode: playOption.RepeatMode }, (err, status) => { });
			});
		});
        client.once('error', function (err) {
            console.log('Error: %s', err.message);
            client.close();
            clearEventEmitter(client);
        });
        setTimeout(() => {
            client.close();
            clearEventEmitter(client);
		}, 10000);

		
    }

	public AddUpdateList(socket: Socket) {
		this.UpdateSocketList[socket.id] = socket;
	}
	public RemoveUpdateList(socket: Socket) {
		delete this.UpdateSocketList[socket.id];
	}

	private UpdateClientSocket(): void {
		let keys = Object.keys(this.UpdateSocketList);
		for (let i: number = 0; i < keys.length; i++) {
			this.UpdateSocketList[keys[i]].emit('update');
		}
	}

	public SetVolume(vol_0_100: number, callback:(obj:any)=>void): void {
		this.PfSender.setVolume({ level: vol_0_100 / 100.0 }, callback);
		return;
	}

	private Media_onStatus(status) {
		this.PlayerStatus = status;
		this.UpdateClientSocket();
    };

    private InitMediaPlayer(): void {
		clearEventEmitter(this.MediaPlayer); this.MediaPlayer = null;
    }

    private InitPlatformSender() {
        delete this.PfSender; 
        this.PfSender = new this.PlatformSender();
        this.PfSender.on('status', (status) => this.onStatus(status));
        this.PfSender.on('error', async (data) => {
            console.error("ON ERROR");
            console.error({ data });
            this.Close();
            await delay_ms(this.ConnectionRetryIntervalMs <= 0 ? 1 : this.ConnectionRetryIntervalMs);
            this.Connect();
		});
		//if (this.Interval_t) clearInterval(this.Interval_t);
		//this.Interval_t = setInterval(() => this.UpdateClientSocket(), 1000);
    }

	constructor(_ipAddress: string, _connectionRetryIntervalMs?: number, urlBase?: string, sox_command?: string) {
		this.IpAddress = _ipAddress;
		this.ConnectionRetryIntervalMs = _connectionRetryIntervalMs ?? this.ConnectionRetryIntervalMs;
		this.UrlBaseString = urlBase;
		GoogleHomeController.Sox = sox_command ?? GoogleHomeController.Sox;
		this.Connect();
	}

	private onStatus(status) {
		this.Status = status;
		// 

        let app = (this.Status.applications || []);
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
			this.UpdateClientSocket();
            this.EndJoin();
        }
    }

    public Connect(): void {
        console.log(`connect to ${this.IpAddress}`);

        this.InitPlatformSender();
        this.PfSender.connect(this.IpAddress, () => {
            this.PfSender.getStatus((err, status) => {
                if (err) {
                    console.error(err);
                    return;
                } else this.onStatus(status);
            });
        });
    }

    public EndJoin() {
        this.InitMediaPlayer();
        this.JoinedAppId = null;
    }

    public Close(): void {
        try {
            this.PfSender.close();
            this.EndJoin();
        } catch (err) {
			console.error(`catch ERROR --- GoogleHomeController.ts  LINE ${__LINE__()}`);
            console.error(err);
        }
    }

    public Finalize(): void {
		if (this.Interval_t) clearInterval(this.Interval_t);
		this.Interval_t = null;
    }
}
