const DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
const PSender = require('castv2-client').PlatformSender;
import {delay_ms} from './utils';

async function main(){
    let ps = new PSender();

    ps.on('error', (err, data)=>{
        console.log("ON ERROR");
        console.log({err});
        console.log({data});
    });
    ps.on('status', (stat, data)=>{
        console.log("ON STATUS");
        console.log({stat});
        console.log(JSON.stringify(stat.applications, null, "  "));
    })


    ps.connect({ host: "192.168.1.24" }, ()=>{
        console.log("connect OK");
    });

    await delay_ms(1000);

    /*
    const Client = require('castv2-client').Client;
    let client = new Client();
    
      client.connect({ host: "192.168.1.24" }, function() {
        console.log('connected, launching app ...');
    
        client.launch(DefaultMediaReceiver, function(err, player) {
          var media = {
    
              // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
            contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
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
    
          player.on('status', function(status) {
            console.log('status broadcast playerState=%s', status.playerState);
          });
    
          console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);
    
          player.load(media, { autoplay: true }, function(err, status) {
            console.log('media loaded playerState=%s', status.playerState);
    
            // Seek to 2 minutes after 15 seconds playing.
            setTimeout(function() {
              player.seek(2*60, function(err, status) {
                //
              });
            }, 15000);
    
          });
    
        });
        
      });
      */


    await delay_ms(5000);

    let joined = 0;
    setInterval(()=>{
        ps.getStatus((d1, d2)=>{
            //console.log({d1});
            //console.log({d2});
        });
        ps.getSessions((s1, s2)=>{
            if(s2.length > 0){
                if(!joined){
                    console.log(" ----- JOIN ---- ");
                    joined = 1;
                    ps.join(s2[0], DefaultMediaReceiver, (err, player)=>{
                        
                        player.on('status', function(status) {
                            console.log(`MEDIA STATUS :: ${JSON.stringify(status)} `);
                        });
                        
                    });
                }
            }
        });
    },1000);

    return;
    await delay_ms(1000);



}

main();


