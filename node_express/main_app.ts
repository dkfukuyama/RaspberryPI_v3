require('dotenv').config({ path: '.env' });
import path = require('path');


const exec = require('child_process').exec;



const gtts = require('@/google_home')
const mail = require('@/send_mail');

const calc = require('@/calculator')
const sch = require('@/scheduler');

import { delay_ms } from '@/UtilFunctions';

import { GHomeMonitor } from '@/GHomeMonitor';
import { GoogleHomeController } from '@/GoogleHomeController';

const Monitor = new GHomeMonitor(parseInt(process.env.SOCKETIO_PORT));

import { AppConf } from '@/AppConf';

let page_path_set_index_ejs: any = {};


page_path_set_index_ejs.pages.forEach(p =>{

    if(p.postfunc){
        app.post(p.path, async function(req, res, next) {
            console.log('postfunc');
            console.log(req.body);

            let er_occurred = false;
            const pfunc_results = await p.postfunc(req, res).catch(err=>{
                er_occurred = true;
                return err;
            });
            console.log(" ----- POST pfunc_results ----- ");
            console.log(pfunc_results);
            if (req.body.short_return) {
                let send_obj = null;
                if (typeof (pfunc_results) == "object") {
                    send_obj = pfunc_results;
                } else {
                    send_obj = {
                        results: pfunc_results,
                    }
                }
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

// テストファイルをぞのまま出力するもの
app.all("/__ftest__/*.*", function (req, res, next) {
    const p = { root: path.join(__dirname, "FunctionTest") };
    res.sendFile(req.path.replace("/__ftest__/", ""), p, (err) => {
        if (err) {
            next(err);
        }
    });
});
// テストファイルをぞのまま出力するもの
app.all("/__utest__/*.*", function (req, res, next) {
    const p = { root: path.join(__dirname, "UnitTest") };
    res.sendFile(req.path.replace("/__utest__/", ""), p, (err) => {
        if (err) {
            next(err);
        }
    });
});

// 指定ファイルをぞのまま出力するもの
app.all("*.css|*.js|*.html", function (req, res, next) {
    const p = { root: path.join(__dirname, "views")};
    res.sendFile(req.path, p, (err)=>{
        if(err){
            next(err);
        }
    });
});

app.get("*.wav|*.mp3", function (req, res, next) {
    const fs = require('fs');

    const p = path.join(AppConf().saveDir0, decodeURI(req.path));
    const query = req.query;
    if (!query.stream) {
        res.sendFile(p, (err) => {
            if (err) {
                next(err);
            }
        });
    } else {
        try {
            fs.stat(p, (err, stat) => {
                if (err) {
                    next(err)
                }
                // ファイル名をエンコードする
                const basename = path.basename(p);
                const filename = encodeURIComponent(basename);

                // ヘッダーセットする
                res.set({
                    'Content-Type': GoogleHomeController.getProperContentType(basename),
                    'Content-disposition': `inline; filename*=utf-8''${filename}`,
                    //'Content-Length': stat.size
                })
                const { spawn } = require('node:child_process');
                //"chorus 1 1 100.0 1 5 5.0 -s"

                const preset: {
                    [key: string]: string;
                } = {
                    "chorus01": "chorus 1 1 100.0 1 5 5.0 -s",
                    "chorus02": "chorus 0.5 0.9 50 0.4 0.25 2 -t 60 0.32 0.4 2.3 -t 40 0.3 0.3 1.3 -s",
                    "reverb01": "reverb",
                    "speedx2": "speed 2",
                    "speedx0_5": "speed 0.5",
                }
                let kk = `sox "${p}" -t wav - `;
                if (preset[query.effectsPreset]) {
                    kk += preset[query.effectsPreset];
                } else if (query.effects) {
                    kk += req.query.effects;
                }

                console.log(kk);
                let sp = spawn(kk, [], { shell: true });
                sp.on('error', (err) => {
                    next(err);
                })
                sp.stdout.pipe(res).on('error', (err) => slk.Err(err) );
            });
        } catch (err) {
            next(err);
        }
    }
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
            command = [];
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

    let httpServerPort = process.env.HTTP_SERVER_PORT;

    slk.Log({
        httpDir0: AppConf().httpDir0,
        httpDir: AppConf().httpDir,
        httpDir_music: AppConf().httpDir_music,
        saveDir0: AppConf().saveDir0,
        voiceSubDir: AppConf().voiceSubDir
    });

    app.listen(httpServerPort, () => slk.Log(`http server port No. ${httpServerPort}`)).on('error', (err) => slk.Err(`......PORT LISTEN ERROR 80...${err}`));
    Monitor.Start();
}


main();
/*
 * 参考記事
https://blog.bagooon.com/?p=1728
https://stackoverflow.com/questions/28819182/expressjs-piping-to-response-stream-doesnt-work
 */