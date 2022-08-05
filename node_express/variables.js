let GL_VARS = {};
let firstTry = true;

const path = require('path');

function globalVars(){

    try{
        if(firstTry || GL_VARS.errorFlag){
            console.log("LOAD VAL");
            GL_VARS.errorFlag = true;
            GL_VARS.serverPort = (process.env.SERVER_PORT ?? 80);
            GL_VARS.voiceSubDir = (process.env.VOICE_SUBDIR ?? 'g_dlfile');

            GL_VARS.httpDir0 = `${getLocalAddress().ipv4[0].address}:${GL_VARS.serverPort}`;
            GL_VARS.httpDir_music = "http://" + GL_VARS.httpDir0;
            GL_VARS.httpDir = "http://" + path.posix.join(GL_VARS.httpDir0, GL_VARS.voiceSubDir);

            GL_VARS.g_calenderSummaryUrl = process.env.G_CAL_SUM;

            switch(process.env.COMPUTERNAME){
                case 'FUKU333_DESKTOP':
                case 'FUKU333-PC':
                    GL_VARS.saveDir0 = "\\\\LANDISK-201129\\disk1\\RaspberryPI_FILES\\Accessible_From_Raspberrypi";
                    break;
                case 'KAIHATU-Z440A':
                    GL_VARS.saveDir0 = path.join(__dirname, "test_mp3");
                    break;
                case 'PI_ZERO_01':
                case 'PI_2B_01':
                default:
                    GL_VARS.saveDir0 = "/mnt/nas_music";
                    break;
            }

            console.log({
                httpDir0:GL_VARS.httpDir0, 
                httpDir: GL_VARS.httpDir,
                httpDir_music: GL_VARS.httpDir_music,
                saveDir0: GL_VARS.saveDir0, 
                voiceSubDir: GL_VARS.voiceSubDir
            });
            
            GL_VARS.saveDir = path.join(GL_VARS.saveDir0, GL_VARS.voiceSubDir);

            GL_VARS.gmail_addr = process.env.GMAIL_ADDR || '';
            GL_VARS.gmail_pass = process.env.GMAIL_PASS || '';

            firstTry = false;
        }
    }catch(err){
        GL_VARS.errorFlag = true;
        console.log(err);
    }
    GL_VARS.errorFlag = false;
    return GL_VARS;
}


function getLocalAddress() {
    const os = require('os');
    let ifacesObj = {}
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = os.networkInterfaces();

    for (let dev in interfaces) {
        interfaces[dev].forEach(function(details){
            if (!details.internal){
                switch(details.family){
                    case "IPv4":
                        ifacesObj.ipv4.push({name:dev, address:details.address});
                    break;
                    case "IPv6":
                        ifacesObj.ipv6.push({name:dev, address:details.address})
                    break;
                }
            }
        });
    }
    return ifacesObj;
};

//globalVars();

exports.globalVars = globalVars;
