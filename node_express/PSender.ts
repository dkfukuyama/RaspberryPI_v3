const DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
const PlatformSender = require('castv2-client').PlatformSender;


import { delay_ms } from './utils';


let JoinedAppId: string|null = null;
let ps = new PlatformSender();
let mediaPlayer = null;
let IpAddress: string = "192.168.1.2";

function connect(dest_addr: string) {
	ps.connect(dest_addr, ()=>{
		ps.getStatus((err, status)=>{
        	console.log({status});
		});
	});
}
async function main(){

	function media_onStatus(status) {
	   	console.log(`MEDIA STATUS :: ${JSON.stringify(status)} `);
	};

    ps.on('error', async (data)=>{
        console.log("ON ERROR");
        console.log({data});
	ps.close();
	await delay_ms(3000);
		connect(IpAddress);
    });
    ps.on('status', (status)=>{
        console.log({status});
		let app = (status.applications || []);

		if (app.length > 0) {
			if ((JoinedAppId && JoinedAppId != app[0].appId) || !JoinedAppId) {
				mediaPlayer?.removeAllListeners(mediaPlayer.eventNames());
				mediaPlayer = null;
				ps.join(app[0], DefaultMediaReceiver, (err, player) => {
					if (err) {
						console.error(err);
						return;
					}
					player.getStatus((err, status) => {
						if (err) {
							console.log(err);
						} else {
							console.log(status);
                        }
					});
					player.on('status', media_onStatus);
					mediaPlayer = player;
					JoinedAppId = app[0].appId;
				});
			}
		} else {
			mediaPlayer?.removeAllListeners(mediaPlayer.eventNames());
			mediaPlayer = null;
			JoinedAppId = null;
		}
    });

	connect(IpAddress);
	
}

export class PlarformSenderWrapper {
	private PfSender = new PlatformSender();
	private JoinedAppId: string | null = null;
	private MediaPlayer = null;

	private IpAddress: string = "";
	private ConnectionRetryIntervalMs: number = 100;

	private Media_onStatus(status) {
		console.log("Media_onStatus");
		console.log(status);
	};

	private InitMediaPlayer(): void {
		mediaPlayer?.removeAllListeners(mediaPlayer.eventNames());
		mediaPlayer = null;
    }

	constructor(_ipAddress: string, _connectionRetryIntervalMs?: number) {
		this.IpAddress = _ipAddress;
		this.ConnectionRetryIntervalMs = _connectionRetryIntervalMs ?? this.ConnectionRetryIntervalMs;

		this.PfSender.on('error', async (data) => {
			console.log("ON ERROR");
			console.log({ data });
			this.PfSender.close();
		});

		this.PfSender.on('status', (status)=>this.onStatus(status));

		this.PfSender.on('error', async (data) => {
			console.log("ON ERROR");
			console.log({ data });
			//ps.close();
			if (this.ConnectionRetryIntervalMs > 0) {
				await delay_ms(this.ConnectionRetryIntervalMs);
				connect(IpAddress);
			}
		});
    }

	private onStatus(status) {
		console.log({ status });
		let app = (status.applications || []);

		if (app.length > 0) {
			if ((this.JoinedAppId && this.JoinedAppId != app[0].appId) || !this.JoinedAppId) {
				this.InitMediaPlayer();

				this.PfSender.join(app[0], DefaultMediaReceiver, (err, player) => {
					if (err) {
						console.error(err);
						return;
					}
					player.on('status', (status)=>this.Media_onStatus(status));
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
			JoinedAppId = null;
		}
	}

	public Connect():void {
		this.PfSender.connect(this.IpAddress, () => {
			this.PfSender.getStatus((err, status) => {
				if (err) {
					console.error(err);
					return;
				} else this.onStatus(status);
			});
		});
	}
};

//main();
const PfSenderW: PlarformSenderWrapper = new PlarformSenderWrapper("192.168.1.24", 1000);

PfSenderW.Connect();



