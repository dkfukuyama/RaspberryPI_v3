"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalAddress = exports.globalVars = void 0;
const path = require("path");
let GL_VARS = {
    errorFlag: false,
    serverPort: 80,
    voiceSubDir: '',
    httpDir0: '',
    httpDir_music: '',
    httpDir: '',
    g_calenderSummaryUrl: '',
    saveDir0: '',
    saveDir: '',
    gmail_addr: '',
    gmail_pass: ''
};
let firstTry = true;
function globalVars() {
    var _a;
    try {
        if (firstTry || GL_VARS.errorFlag) {
            console.log("LOAD VAL");
            GL_VARS.errorFlag = true;
            GL_VARS.serverPort = (parseInt(process.env.SERVER_PORT) || 80);
            GL_VARS.voiceSubDir = ((_a = process.env.VOICE_SUBDIR) !== null && _a !== void 0 ? _a : 'g_dlfile');
            if (process.env.TEST_IPV4) {
                GL_VARS.httpDir0 = `${process.env.TEST_IPV4}:${GL_VARS.serverPort}`;
            }
            else {
                const ipv4 = getLocalAddress().ipv4;
                if (ipv4.length == 0)
                    throw new Error('Http Addr cannot be detected');
                GL_VARS.httpDir0 = `${ipv4[0].address}:${GL_VARS.serverPort}`;
            }
            GL_VARS.httpDir_music = "http://" + GL_VARS.httpDir0;
            GL_VARS.httpDir = "http://" + path.posix.join(GL_VARS.httpDir0, GL_VARS.voiceSubDir);
            GL_VARS.g_calenderSummaryUrl = process.env.G_CAL_SUM;
            switch (process.env.COMPUTERNAME) {
                case 'FUKU333_DESKTOP':
                case 'FUKU333-PC':
                    GL_VARS.saveDir0 = "\\\\LANDISK-201129\\disk1\\RaspberryPI_FILES\\Accessible_From_Raspberrypi";
                    break;
                case 'FUKUYAMA':
                    GL_VARS.saveDir0 = path.join(__dirname, "test_mp3");
                    break;
                case 'PI_ZERO_01':
                case 'PI_2B_01':
                default:
                    GL_VARS.saveDir0 = "/mnt/nas_music";
                    break;
            }
            console.log({
                httpDir0: GL_VARS.httpDir0,
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
        GL_VARS.errorFlag = false;
    }
    catch (err) {
        GL_VARS.errorFlag = true;
        console.log(err);
    }
    finally {
        return GL_VARS;
    }
}
exports.globalVars = globalVars;
function getLocalAddress() {
    const os = require('os');
    let ifacesObj = {};
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = os.networkInterfaces();
    for (let dev in interfaces) {
        interfaces[dev].forEach(function (details) {
            var _a;
            if (!details.internal) {
                let add0 = (_a = details === null || details === void 0 ? void 0 : details.address) !== null && _a !== void 0 ? _a : '';
                switch (details.family) {
                    case "IPv4":
                        ifacesObj.ipv4.push({ name: dev, address: add0 });
                        break;
                    case "IPv6":
                        ifacesObj.ipv6.push({ name: dev, address: add0 });
                        break;
                }
            }
        });
    }
    return ifacesObj;
}
exports.getLocalAddress = getLocalAddress;
;
exports.globalVars = globalVars;
//# sourceMappingURL=variables.js.map