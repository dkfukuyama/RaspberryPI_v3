require('dotenv').config({ path: '.env' });
import path = require('path');

const exec = require('child_process').exec;

const gtts = require('@/google_home')
const calc = require('@/calculator')
const sch = require('@/scheduler');

import { delay_ms } from '@/UtilFunctions';
import * as NodeMailerWrapper from '@/NodeMailerWrapper';

import { AppConf, slk } from '@/AppConf';
import { App } from '@/GlobalObj';
import { Monitor } from '@/AppFunctions';


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

function OverWriteCompiledJsFile(filePath: string) {
    var fs = require('fs')
    fs.readFile(filePath, 'utf8', function (err, data) {
        console.log(`OPEN ${filePath}`);
        if (err) {
            return console.error(err);
        }
        var result = data.replace(/(Object\.defineProperty\(exports)/g, '//$1');

        fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
                console.error(err);
                return;
            }
        });
    });
}

async function main0() {
    slk.Log("********************\n*** SYSTEM START ***\n********************");
    const date: any = new Date();
    const currentTime = date.toFormat('YYYY-MM-DD HH24:MI:SS');
    slk.Log({ current_time: currentTime, computer_name: process.env.COMPUTERNAME });

    let sn = await new Promise<any>((resolve, reject) => {
        const c = 'git log -1';
        exec(c, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(stderr);
            } else {
                resolve({ command: c, results: stdout });
            }
        });
    });
    slk.Log(sn);

    OverWriteCompiledJsFile('views/scripts/connect.js');

    sch.setNodeCrontab();

    let httpServerPort = process.env.HTTP_SERVER_PORT;

    slk.Log({
        httpDir0: AppConf().httpDir0,
        httpDir: AppConf().httpDir,
        httpDir_music: AppConf().httpDir_music,
        saveDir0: AppConf().saveDir0,
        voiceSubDir: AppConf().voiceSubDir
    });


    App.listen(httpServerPort, () => slk.Log(`http server port No. ${httpServerPort}`)).on('error', (err) => slk.Err(`......PORT LISTEN ERROR 80...${err}`));
    Monitor.Start();
}

async function main_wrap() {
    const mail = new NodeMailerWrapper.NodeMailer(process.env.GMAIL_ADDR, process.env.GMAIL_PASS);

    //for (; ;) {
    mail.SendTextAndAttachmentsAsync("PI-02B boot", `${new Date()}`, [{ filename: "out.log", path: "out.log" }, { filename: "error.log", path: "error.log" }])
        .then(res => { console.log("SEND MAIL OK"); console.log(res); })
        .catch(err => console.error(err));
 
        await main0().then(() => {
            slk.Err("Enter into the Main->then routine");
        }).catch(err => {
            slk.Err("Enter into the Main->catch routine");
            slk.Err(err);
        });
    //}
}
main_wrap();

/*
 * 参考記事
https://blog.bagooon.com/?p=1728
https://stackoverflow.com/questions/28819182/expressjs-piping-to-response-stream-doesnt-work
 */