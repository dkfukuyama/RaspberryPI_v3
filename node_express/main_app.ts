﻿require('dotenv').config();

import path = require('path');
const exec = require('child_process').exec;

const express = require("express");
const favicon = require('express-favicon');
const bodyParser = require('body-parser');
const app = express();
app.use(favicon(path.join(__dirname, '/views/ico/favicon.png')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

// テンプレートエンジンの指定
app.set("view engine", "ejs");

import { globalVars } from '@/variables';
import { Slack } from '@/SlackSend';

const gtts = require('@/google_home')
const mail = require('@/send_mail');

const calc = require('@/calculator')
const sch = require('@/scheduler');

import { GHomeMonitor } from '@/GHomeMonitor';
import { GoogleHomeController } from '@/GoogleHomeController';

const Monitor = new GHomeMonitor(parseInt(process.env.SOCKETIO_PORT));
const slk = new Slack(process.env.SLACK_WEBHOOK);


let page_path_set_index_ejs: any = {};

function update_common_paramters(){
    page_path_set_index_ejs.common = {
        ghomeSpeakers: GoogleHomeController.gHomeAddresses,
        server_ws: `ws://${globalVars().httpDir0}:${process.env.SOCKETIO_PORT}`
    }
}

page_path_set_index_ejs.pages = [
    {
        path: '/',
        title: 'こんにちは、ぐーぐるさんだよ',
        level: 0
    },
    {
        path: '/test',
        title: 'しゃべらせたいとき(テスト)',
        view_page: './test.ejs',
        level: 0,
    },
    {
        path: '/speak',
        title: 'しゃべらせたいとき',
        view_page: './speak.ejs',
        level: 0,
        postfunc: async (req, res) => {
            console.log(`req.body.submit = ${req.body.submit}`);
            let speaker_name = '';
            if(req.body.submit.startsWith('google|')){
                console.log('グーグルスピーカーモード');
                speaker_name = req.body.submit.replace('google|','');
                console.log(speaker_name);
                return gtts.speechOnGoogleHome(
                    speaker_name,
                    {
                        text: req.body.text,
                        reverse_play: req.body.reverse_play,
                        pitch: req.body.pitch,
                        rb_effects1 : req.body.rb_effects1,
                        speakingRate: req.body.speed,
                        volume: req.body.volume,
                        voiceTypeId: req.body.voice_type
                    }
                );
            }else switch (req.body.submit) {
                case 'otosan':
                    console.log('おとうさん送信モード');
                    return gtts.speechOnGoogleHome(
                        '',
                        {
                            text: req.body.text,
                            reverse_play: req.body.reverse_play,
                            rb_effects1 : req.body.rb_effects1,
                            pitch: req.body.pitch,
                            speakingRate: req.body.speed,
                            volume: req.body.volume,
                            voiceTypeId: req.body.voice_type
                        }
                    ).then((params) => {
                        let mailer = new mail.NodeMailer(process.env.GMAIL_ADDR, process.env.GMAIL_PASS);
                        mailer.SendTextAndAttachment('ぐーぐるだよ', req.body.text, params.outfilePath);
                    }).catch(er=>console.log(er)).then((d)=>Promise.resolve(d));
            }
            return;
        },
        specialParams : {
            voiceTypes : require('./google_tts').voiceType,
        }
    },
    {
        path: '/calculator',
        title: 'でんたく',
        view_page: './calculator.ejs',
        level: 0,
        postfunc: async (req, res)=>{
            console.log(`req.body.submit = ${req.body.submit}`);

            req.body.text = calc.make_calculation_text(req.body);

            let speaker_name = '';
            if(req.body.submit.startsWith('google|')){
                console.log('グーグルスピーカーモード');
                speaker_name = req.body.submit.replace('google|','');
                console.log(speaker_name);
                return gtts.speechOnGoogleHome(
                    speaker_name,
                    {
                        text: req.body.text,
                        volume: req.body.volume,
                        voiceTypeId: req.body.voice_type
                    }
                );
            }else switch (req.body.submit) {
                case 'otosan':
                    console.log('おとうさん送信モード');
                    return gtts.speechOnGoogleHome(
                        '',
                        {
                            text: req.body.text,
                            volume: req.body.volume,
                            voiceTypeId: req.body.voice_type
                        }
                    ).then((params) => {
                        let mailer = new mail.NodeMailer();
                        mailer.SendTextAndAttachment('ぐーぐるだよ', req.body.text, params.outfilePath);
                    }).catch(er=>console.log(er)).then((d)=>Promise.resolve(d));
            }
            return;
        },
        specialParams:{
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
        postfunc: async (req, res)=>{
            if(req.body.mode == 'playOnce'){
                let filename = encodeURI(globalVars().httpDir_music + "/" + req.body.filename);
                Promise.resolve();
                //return ghome.play(req.body.gHomeName, filename, { volume: 80 });
            }
            return Promise.reject({error : `FALSE play :: ${req.body.filename}`});
        },
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
        postfunc: async (req, res)=>{
            if(req.body.mode)
            {
                console.log('COMMAND MODE');
                console.log(req.body.mode);
                slk.Log('COMMAND MODE');
                slk.Log(req.body.mode);
                switch(req.body.mode){
                    case 'cal_today':
                        return Promise.resolve();
                        //return gtts.speechOnGoogleHomeCal(ghome.getGoogleHomeAddresses()[0].speakerName, {});
                        break;
                    case 'clean_wav':
                        return new Promise((resolve, _) => resolve(require('./clean').clean_wav(100)));
                        break;
                    case 'system_command':
                        console.log(`${req.body.command}`);
                        return new Promise((resolve, reject) => {
                            exec(req.body.command, (err, stdout, stderr) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log(`stdout: ${stdout}`)
                                    resolve(stdout);
                                }
                            });
                        });
                        break;
                    default:
                        return new Promise<void>((resolve, _)=>resolve());
                }
            }
        }
    }
]

page_path_set_index_ejs.pages.forEach(p =>{

    if(p.postfunc){
        app.post(p.path, async function(req, res, next) {
            console.log('postfunc');
            console.log(req.body);

            let er_occurred = false;
            const pfunc_results = await p.postfunc(req, res).catch(er=>{
                er_occurred = true;
                return JSON.stringify(er);
            });
            console.log(" ----- POST pfunc_results ----- ");
            console.log(pfunc_results);
            if (req.body.short_return) {
                res.json(pfunc_results);
                res.end();
            }else{
                next();
            }
        });
    }
    if(p.getfunc){
        app.get(p.path, async function(req, res, next) {
            console.log('getfunc');
            console.log(req.query);

            let er_occurred = false;
            const pfunc_results = await p.getfunc(req, res).catch(er=>{
                er_occurred = true;
                return JSON.stringify(er);
            });
            console.log(" ----- GET pfunc_results ----- ");
            console.log(pfunc_results);
            if (req.body.short_return) {
                res.json(pfunc_results);
                res.end();
            }else{
                next();
            }
        });
    }
    app.all(p.path, function (req, res) {
        try{
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

        }catch(er){
            console.log('CATCH ERROR');

            let data = {
                title: p.title,
                view_page : p.view_page,
                errors: er
            };

            res.render("./ER/error.ejs", data);
        }
    });
});

app.all("*.css|*.js", function (req, res, next) {
    const p = { root: path.join(__dirname, "views")};
    res.sendFile(req.path, p, (err)=>{
        if(err){
            next(err);
        }
    });
});

app.all("/stream/*.wav|*.mp3", function (req, res, next) {

    console.log(req.path);

    const fs = require('fs');

    const p = path.join(globalVars().saveDir0, req.path);

    let fpath = decodeURI(p);
    fs.stat(fpath, (err, stat) => {
        if (err) {
            next(err)
        }
        // ファイル名をエンコードする
        const filename = encodeURIComponent("aaa.mp3");
        // ヘッダーセットする
        res.set({
            'Content-Type': "audio/mpeg",
            'Content-disposition': `inline; filename*=utf-8''${filename}`,
            'Content-Length': stat.size
        })
        let filestream = fs.createReadStream(fpath)
        filestream.pipe(res)
    })
});

app.get("*.wav|*.mp3", function (req, res, next){
    const p = path.join(globalVars().saveDir0, req.path);
    res.sendFile(decodeURI(p), (err)=>{
        if(err){
            next(err);
        }
    });
});

app.use(function(req, res, next){
    console.log(`404 NOT FOUND ERROR : ${req.path}`);
    res.status(404);
    res.render("./ER/404.ejs", {path: req.path, pages: page_path_set_index_ejs.pages });
});

app.use((err, req, res, next) => {
    res.status(err.status);
    res.render("./ER/500.ejs", {path: req.path, pages: page_path_set_index_ejs.pages });
})

async function npm_install(): Promise<any> {

    let command: string[] = [];
    switch (process.env.COMPUTERNAME) {
        case 'PI_ZERO_01':
        case 'PI_2B_01':
            command = ['sudo npm install'];
            break;
        default:
            command = ['npm install'];
            break;
    }

    return Promise.all(
    command.map(async c => { 
        return new Promise((resolve, reject) => {
            if (c) {
                exec(c, { windowsHide: true }, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err);
                        reject(stderr);
                    } else {
                        resolve({ command: c, results: stdout});
                    }
                });
            } else resolve("npm install is NOT executed");
        })
    })
    );
}

async function main() {
    slk.Log("********************\n*** SYSTEM START ***\n********************");
    const date: any = new Date();
    const currentTime = date.toFormat('YYYY-MM-DD HH24:MI:SS');
    slk.Log({ current_time: currentTime, computer_name: process.env.COMPUTERNAME });

    sch.setNodeCrontab();

    await npm_install().then((t)=>slk.Log(t)).catch((e)=>console.error(e));

    let httpServerPort = process.env.HTTP_SERVER_PORT;

    slk.Log({
        httpDir0: globalVars().httpDir0,
        httpDir: globalVars().httpDir,
        httpDir_music: globalVars().httpDir_music,
        saveDir0: globalVars().saveDir0,
        voiceSubDir: globalVars().voiceSubDir
    });

    app.listen(httpServerPort, () => slk.Log(`http server port No. ${httpServerPort}`));

    Monitor.Start();
}

main();

/*
 * 参考記事
https://blog.bagooon.com/?p=1728
https://stackoverflow.com/questions/28819182/expressjs-piping-to-response-stream-doesnt-work
 */