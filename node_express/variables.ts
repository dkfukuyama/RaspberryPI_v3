import path = require('path');

const httpServerPort_Default = 80;

interface IGL {
    errorFlag: boolean;
    httpServerPort: number;
    voiceSubDir: string;

    httpDir0: string;
    httpDir_music: string;
    httpDir: string;

    saveDir0: string;
    saveDir: string;

    simulation_mode: boolean|number;
}

let GL_VARS: IGL = {
    errorFlag: false,
    httpServerPort: httpServerPort_Default,
    voiceSubDir: '',
    httpDir0: '',
    httpDir_music: '',
    httpDir: '',
    saveDir0: '',
    saveDir: '',

    simulation_mode: false
};

let firstTry = true;

export function globalVars(): IGL {
    try {
        if (firstTry || GL_VARS.errorFlag) {
            console.log("LOAD VAL");
            GL_VARS.errorFlag = true;
            GL_VARS.httpServerPort = (parseInt(process.env.HTTP_SERVER_PORT) || GL_VARS.httpServerPort);
            GL_VARS.voiceSubDir = (process.env.VOICE_SUBDIR ?? 'g_dlfile');

            console.log({ TEST_MODE : process.env.TEST_IPV4 });
            if (process.env.TEST_IPV4) {
                GL_VARS.httpDir0 = `${process.env.TEST_IPV4}`;
            } else {
                const ipv4 = getLocalAddress().ipv4;
                if (!ipv4.length) throw new Error('Http Addr cannot be detected');
                GL_VARS.httpDir0 = `${ipv4[0].address}`;
            }
            if (GL_VARS.httpServerPort != httpServerPort_Default) GL_VARS.httpDir0 += `:${GL_VARS.httpServerPort}`;

            GL_VARS.httpDir_music = "http://" + GL_VARS.httpDir0;
            GL_VARS.httpDir = "http://" + path.posix.join(GL_VARS.httpDir0, GL_VARS.voiceSubDir);

            switch (process.env.COMPUTERNAME) {
                case 'FUKU333_DESKTOP':
                case 'FUKU333-PC':
                    GL_VARS.saveDir0 = "\\\\LANDISK-201129\\disk1\\RaspberryPI_FILES\\Accessible_From_Raspberrypi";
                    break;
                case 'FUKUYAMA':
                    GL_VARS.simulation_mode = 2;
                    GL_VARS.saveDir0 = path.join(__dirname, "test_mp3");
                    break;
                case 'PI_ZERO_01':
                case 'PI_2B_01':
                default:
                    GL_VARS.saveDir0 = "/mnt/nas_music";
                    break;
            }
            GL_VARS.saveDir = path.join(GL_VARS.saveDir0, GL_VARS.voiceSubDir);

            firstTry = false;
        }
        GL_VARS.errorFlag = false;
    } catch (err) {
        GL_VARS.errorFlag = true;
        console.log(err);
    } finally {
        return GL_VARS;
    }
}

export function getLocalAddress() {

    let ifacesObj: any = {};
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = require('os').networkInterfaces();

    for (let dev in interfaces) {
        interfaces[dev].forEach(function (details: any) {
            if (!details.internal) {
                let add0: string = details?.address ?? '';
                switch(details.family){
                    case 4:
                    case "IPv4":
                        ifacesObj.ipv4.push({name:dev, address:add0});
                    break;
                    case 6:
                    case "IPv6":
                        ifacesObj.ipv6.push({name:dev, address:add0})
                    break;
                }
            }
        });
    }
    return ifacesObj;
};

exports.globalVars = globalVars;
