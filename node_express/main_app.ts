require('dotenv').config({ path: '.env' });
import path = require('path');

const exec = require('child_process').exec;

const gtts = require('@/google_home')
const mail = require('@/send_mail');

const calc = require('@/calculator')
const sch = require('@/scheduler');

import { delay_ms } from '@/UtilFunctions';

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


async function main() {
    slk.Log("********************\n*** SYSTEM START ***\n********************");
    const date: any = new Date();
    const currentTime = date.toFormat('YYYY-MM-DD HH24:MI:SS');
    slk.Log({ current_time: currentTime, computer_name: process.env.COMPUTERNAME });

    await new Promise((resolve, reject) => {
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


main();
/*
 * 参考記事
https://blog.bagooon.com/?p=1728
https://stackoverflow.com/questions/28819182/expressjs-piping-to-response-stream-doesnt-work
 */