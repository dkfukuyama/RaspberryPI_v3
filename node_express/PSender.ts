const DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
const PlatformSender = require('castv2-client').PlatformSender;
import {delay_ms} from './utils';


let JoinedAppId: string|null = null;
let ps = new PlatformSender();
let mediaPlayer = null;

function connect(){
	ps.connect({ host: "192.168.1.24" }, ()=>{
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
	connect();
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

	connect();
	
}

main();


