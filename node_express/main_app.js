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
const express = require("express");
const app = express();
const gtts = require('./google_home');
const favicon = require('express-favicon');
const vars = require('./variables');
const exec = require('child_process').exec;
const { execSync } = require('child_process');
const bodyParser = require('body-parser');
const mail = require('./send_mail');
const ghome = require('./gHomeCnt');
const ut = require('./utils');
const calc = require('./calculator');
const slk = require('./slacksend');
const sch = require('./scheduler');
require('date-utils');
const path = require("path");
app.use(favicon(path.join(__dirname, '/views/ico/favicon.png')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
// テンプレートエンジンの指定
app.set("view engine", "ejs");
const speaker_name = '2Fリビング';
let volumeLevel = 30;
let page_path_set_index_ejs = {};
function update_common_paramters() {
    page_path_set_index_ejs.common = {
        ghomeSpeakers: ghome.getGoogleHomeAddresses(),
    };
}
page_path_set_index_ejs.pages = [
    {
        path: '/',
        title: 'こんにちは、ぐーぐるさんだよ',
        level: 0
    },
    {
        path: '/speak',
        title: 'しゃべらせたいとき',
        view_page: './speak.ejs',
        level: 0,
        postfunc: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`req.body.submit = ${req.body.submit}`);
            let speaker_name = '';
            if (req.body.submit.startsWith('google|')) {
                console.log('グーグルスピーカーモード');
                speaker_name = req.body.submit.replace('google|', '');
                console.log(speaker_name);
                return gtts.speechOnGoogleHome(speaker_name, {
                    text: req.body.text,
                    reverse_play: req.body.reverse_play,
                    pitch: req.body.pitch,
                    rb_effects1: req.body.rb_effects1,
                    speakingRate: req.body.speed,
                    volume: req.body.volume,
                    voiceTypeId: req.body.voice_type
                });
            }
            else
                switch (req.body.submit) {
                    case 'otosan':
                        console.log('おとうさん送信モード');
                        return gtts.speechOnGoogleHome('', {
                            text: req.body.text,
                            reverse_play: req.body.reverse_play,
                            rb_effects1: req.body.rb_effects1,
                            pitch: req.body.pitch,
                            speakingRate: req.body.speed,
                            volume: req.body.volume,
                            voiceTypeId: req.body.voice_type
                        }).then((params) => {
                            let mailer = new mail.NodeMailer();
                            mailer.SendTextAndAttachment('ぐーぐるだよ', req.body.text, params.outfilePath);
                        }).catch(er => console.log(er)).then((d) => Promise.resolve(d));
                }
            return;
        }),
        specialParams: {
            voiceTypes: require('./google_tts').voiceType,
        }
    },
    {
        path: '/calculator',
        title: 'でんたく',
        view_page: './calculator.ejs',
        level: 0,
        postfunc: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`req.body.submit = ${req.body.submit}`);
            req.body.text = calc.make_calculation_text(req.body);
            let speaker_name = '';
            if (req.body.submit.startsWith('google|')) {
                console.log('グーグルスピーカーモード');
                speaker_name = req.body.submit.replace('google|', '');
                console.log(speaker_name);
                return gtts.speechOnGoogleHome(speaker_name, {
                    text: req.body.text,
                    volume: req.body.volume,
                    voiceTypeId: req.body.voice_type
                });
            }
            else
                switch (req.body.submit) {
                    case 'otosan':
                        console.log('おとうさん送信モード');
                        return gtts.speechOnGoogleHome('', {
                            text: req.body.text,
                            volume: req.body.volume,
                            voiceTypeId: req.body.voice_type
                        }).then((params) => {
                            let mailer = new mail.NodeMailer();
                            mailer.SendTextAndAttachment('ぐーぐるだよ', req.body.text, params.outfilePath);
                        }).catch(er => console.log(er)).then((d) => Promise.resolve(d));
                }
            return;
        }),
        specialParams: {
            voiceTypes: require('./google_tts').voiceType,
        },
    },
    {
        path: '/music',
        title: 'おんがくをかける',
        view_page: './music.ejs',
        level: 0,
        specialParams: {
            musicList_get: require('./get_musicList').get,
        },
        postfunc: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            if (req.body.mode == 'playOnce') {
                let filename = encodeURI(vars.globalVars().httpDir_music + "/" + req.body.filename);
                return ghome.play(req.body.gHomeName, filename, { volume: 80 });
            }
            return Promise.reject({ error: `FALSE play :: ${req.body.filename}` });
        }),
    },
    {
        path: '',
        title: 'クイズゲーム',
        view_page: './quiz.ejs',
        level: 0
    },
    {
        path: '/quiz/play',
        title: 'あそぶ',
        title2: 'クイズゲームであそぶ',
        view_page: './quiz.ejs',
        level: 1
    },
    {
        path: '/quiz/make',
        title: 'つくる',
        title2: 'クイズゲームをつくる',
        view_page: './quiz.ejs',
        level: 1
    },
    {
        path: '/config',
        title: 'かんり、せってい',
        view_page: './config.ejs',
        level: 0,
    },
    {
        path: '/command',
        title: '',
        hidden: true,
        postfunc: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            if (req.body.mode) {
                console.log('COMMAND MODE');
                console.log(req.body.mode);
                slk.slacksend('COMMAND MODE');
                slk.slacksend(req.body.mode);
                switch (req.body.mode) {
                    case 'cal_today':
                        return gtts.speechOnGoogleHomeCal(ghome.getGoogleHomeAddresses()[0].speakerName, {});
                    case 'clean_wav':
                        return new Promise((resolve, _) => resolve(require('./clean').clean_wav(100)));
                    case 'system_command':
                        console.log(`${req.body.command}`);
                        return new Promise((resolve, reject) => {
                            exec(req.body.command, (err, stdout, stderr) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    console.log(`stdout: ${stdout}`);
                                    resolve(stdout);
                                }
                            });
                        });
                    default:
                        return new Promise((resolve, _) => resolve());
                }
            }
        })
    }
];
page_path_set_index_ejs.pages.forEach(p => {
    if (p.postfunc) {
        app.post(p.path, function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('postfunc');
                console.log(req.body);
                let er_occurred = false;
                const pfunc_results = yield p.postfunc(req, res).catch(er => {
                    er_occurred = true;
                    return JSON.stringify(er);
                });
                console.log(" ----- POST pfunc_results ----- ");
                console.log(pfunc_results);
                if (req.body.short_return) {
                    res.json(pfunc_results);
                    res.end();
                }
                else {
                    next();
                }
            });
        });
    }
    if (p.getfunc) {
        app.get(p.path, function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('getfunc');
                console.log(req.query);
                let er_occurred = false;
                const pfunc_results = yield p.getfunc(req, res).catch(er => {
                    er_occurred = true;
                    return JSON.stringify(er);
                });
                console.log(" ----- GET pfunc_results ----- ");
                console.log(pfunc_results);
                if (req.body.short_return) {
                    res.json(pfunc_results);
                    res.end();
                }
                else {
                    next();
                }
            });
        });
    }
    app.all(p.path, function (req, res) {
        try {
            let data = {
                page: p,
                items: null
            };
            // レンダリングを行う
            update_common_paramters();
            res.render("./index.ejs", {
                data: data,
                prevPostData: req.body,
                query: req.query,
                pages: page_path_set_index_ejs.pages,
                common: page_path_set_index_ejs.common
            });
        }
        catch (er) {
            console.log('CATCH ERROR');
            let data = {
                title: p.title,
                view_page: p.view_page,
                errors: er
            };
            res.render("./ER/error.ejs", data);
        }
    });
});
app.all("*.css", function (req, res, next) {
    const p = { root: path.join(__dirname, "views") };
    res.sendFile(req.path, p, (err) => {
        if (err) {
            next(err);
        }
    });
});
app.get("*.wav|*.mp3", function (req, res, next) {
    const p = path.join(vars.globalVars().saveDir0, req.path);
    res.sendFile(decodeURI(p), (err) => {
        if (err) {
            next(err);
        }
    });
});
app.use(function (req, res, next) {
    console.log(`404 NOT FOUND ERROR : ${req.path}`);
    res.status(404);
    res.render("./ER/404.ejs", { path: req.path, pages: page_path_set_index_ejs.pages });
});
app.use((err, req, res, next) => {
    res.status(err.status);
    res.render("./ER/500.ejs", { path: req.path, pages: page_path_set_index_ejs.pages });
});
console.log(`process.env.SLACK_WEBHOOK=${process.env.SLACK_WEBHOOK}`);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let command = "";
        switch (process.env.COMPUTERNAME) {
            case 'PI_ZERO_01':
            case 'PI_2B_01':
                command = 'sudo npm install';
                break;
            default:
                command = 'npm install';
                break;
        }
        const stdout = execSync(command);
        console.log(stdout);
        let httpServerPort = vars.globalVars().serverPort;
        app.listen(httpServerPort, () => console.log(`http server port No. ${httpServerPort}`));
        ghome.startSeekGoogleLoop();
        slk.slacksend('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
        slk.slacksend(process.env.COMPUTERNAME);
        slk.slacksend('system start');
        const date = new Date();
        const currentTime = date.toFormat('YYYY-MM-DD HH24:MI:SS');
        slk.slacksend(currentTime);
        sch.setNodeCrontab();
        for (let i = 0;; yield ut.delay_ms(1000)) {
            if (ghome.getGoogleHomeAddresses().length) {
                if (i == 0)
                    console.log(ghome.getGoogleHomeAddresses());
                else {
                }
            }
            else {
                i = -1;
            }
            i = (i + 1) % 10000;
        }
    });
}
main();
//# sourceMappingURL=main_app.js.map