"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ut = require('./utils');
const bonjour = require('bonjour')();
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
let gHomeAddresses = [];
let gHomeSeekFlag_timeout = null;
let secondsCount = 0;
function getGoogleHomeAddresses() {
    return gHomeAddresses;
}
function getGHAddrFromName(speakerName) {
    let returnval = [];
    gHomeAddresses.forEach((a) => {
        if (a.speakerName == speakerName) {
            returnval.push(a.address);
        }
    });
    return returnval;
}
function startSeekGoogleLoop() {
    stopSeekGoogleLoop();
    gHomeSeekFlag_timeout = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        if (gHomeAddresses == null || gHomeAddresses.length == 0 || secondsCount == 0) {
            gHomeAddresses = yield seekGoogleHomes(1000, 0);
        }
        secondsCount = (secondsCount + 1) % 30;
    }), 1200);
}
function stopSeekGoogleLoop() {
    if (gHomeSeekFlag_timeout) {
        clearInterval(gHomeSeekFlag_timeout);
    }
}
function seekGoogleHomes(timeout, repeatType) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, _) => {
            let return_val = [];
            const browser = bonjour.find({ type: 'googlecast' }, 
            //const browser = bonjour.find({ type: 'http' },
            function (service) {
                var _a, _b;
                //console.log(service);
                return_val.push(
                //{ address: s.addresses[0], friendlyName: s.txt.fn }
                { address: service.addresses[0], friendlyName: service.name, speakerName: (_b = (_a = service === null || service === void 0 ? void 0 : service.txt) === null || _a === void 0 ? void 0 : _a.fn) !== null && _b !== void 0 ? _b : '' });
            });
            return_val.sort();
            setTimeout(() => {
                browser.stop();
                resolve(return_val);
            }, timeout);
        });
    });
}
function getProperContentType(url) {
    let extType = url.substr(-4);
    const contentTypes = {
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
    };
    return contentTypes[extType];
}
function play(gHomeName, playUrl, params) {
    return new Promise((resolve, reject) => {
        let adrs = getGHAddrFromName(gHomeName);
        if (adrs.length == 0) {
            reject(`the address corresponds to "${gHomeName}" is NOT FOUND!!`);
            return;
        }
        const client = new Client();
        client.connect({ host: adrs[0] }, function () {
            return __awaiter(this, void 0, void 0, function* () {
                let contentType = getProperContentType(playUrl);
                console.log([playUrl, contentType]);
                if (params.volume) {
                    console.log(`volume set ${params.volume}`);
                    client.setVolume({
                        muted: false,
                        level: params.volume / 100,
                    }, function (err, vol) {
                        if (err) {
                            client.close();
                            reject(err); // handle error
                        }
                    });
                }
                client.launch(DefaultMediaReceiver, function (err, player) {
                    var media = {
                        contentId: playUrl,
                        contentType: contentType,
                        streamType: 'BUFFERED', // or LIVE
                    };
                    player.on('status', function (status) {
                        console.log('status broadcast playerState=%s', status.playerState);
                        if (status.playerState && status.playerState == "PLAYING") {
                            client.close();
                            resolve("PLAYING");
                        }
                    });
                    player.load(media, { autoplay: true }, function (err, status) {
                        if (status === null || status === void 0 ? void 0 : status.playerState) {
                            console.log('media loaded playerState=%s', status.playerState);
                        }
                        else {
                            console.log('media loaded playerState=NULL_OR_UNDEF');
                        }
                    });
                });
            });
        });
        client.on('error', function (err) {
            client.close();
            reject(`Error: ${err.message}`);
        });
    });
}
function play_dir(gHomeName, dirPath, fileName, params) {
    return __awaiter(this, void 0, void 0, function* () {
        return play(gHomeName, vars.globalVars().httpDir + "/" + fileName, params);
    });
}
function playAsync(gHomeName, playUrl) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function pushPlayList(gHomeName, playUrl) {
}
function clearPlayList(gHomeName) {
}
function interruptPlay(gHomeName, playUrl) {
}
function interruptAndResumePlay(gHomeName, playUrl) {
}
function setVolume(gHomeName, playVolume) {
    return new Promise((resolve, reject) => {
        let adrs = getGHAddrFromName(gHomeName);
        if (adrs.length == 0) {
            reject(`the address corresponds to "${gHomeName}" is NOT FOUND!!`);
            return;
        }
        const client = new Client();
        client.connect({ host: adrs[0] }, function () {
            client.setVolume({
                muted: false,
                level: playVolume / 100,
            }, function (err, vol) {
                if (err) {
                    client.close();
                    reject(err); // handle error
                }
                else {
                    resolve(playVolume);
                }
            });
        });
        client.on('error', function (err) {
            client.close();
            reject(`Error: ${err.message}`);
        });
    });
}
function getVolume(gHomeName) {
    return new Promise((resolve, reject) => {
        let adrs = getGHAddrFromName(gHomeName);
        if (adrs.length == 0) {
            reject(`the address corresponds to "${gHomeName}" is NOT FOUND!!`);
            return;
        }
        const client = new Client();
        client.connect({ host: adrs[0] }, function () {
            client.getVolume(function (err, vol) {
                if (err) {
                    client.close();
                    reject(err); // handle error
                }
                client.close();
                resolve(vol); // {"controlType":"attenuation","level":0.7999999523162842,"muted":false,"stepInterval":0.05000000074505806}
            });
        });
        client.on('error', function (err) {
            client.close();
            reject(`Error: ${err.message}`);
        });
    });
}
function getVolumeAll() {
    return new Promise((resolve, reject) => {
        const gHomeName = "ERROR";
        let adrs = getGHAddrFromName(gHomeName);
        if (adrs.length == 0) {
            reject(`the address corresponds to "${gHomeName}" is NOT FOUND!!`);
            return;
        }
        const client = new Client();
        client.connect({ host: adrs[0] }, function () {
            client.getVolume(function (err, vol) {
                if (err) {
                    client.close();
                    reject(err); // handle error
                }
                client.close();
                resolve(vol); // {"controlType":"attenuation","level":0.7999999523162842,"muted":false,"stepInterval":0.05000000074505806}
            });
        });
        client.on('error', function (err) {
            client.close();
            reject(`Error: ${err.message}`);
        });
    });
}
function sample_play_func(host) {
    const client = new Client();
    client.connect({ host: host }, function () {
        console.log('connected, launching app ...');
        client.launch(DefaultMediaReceiver, function (err, player) {
            var media = {
                // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
                //contentType: 'audio/mp3',
                contentType: 'video/mp4',
                streamType: 'BUFFERED',
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
exports.getGoogleHomeAddresses = getGoogleHomeAddresses;
exports.startSeekGoogleLoop = startSeekGoogleLoop;
exports.stopSeekGoogleLoop = stopSeekGoogleLoop;
exports.getGHAddrFromName = getGHAddrFromName;
exports.play = play;
exports.play_dir = play_dir;
exports.getVolume = getVolume;
//# sourceMappingURL=gHomeCnt.js.map