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
const slk = require('./slacksend');
const ut = require('./utils');
const exec = require('child_process').exec;
const cron = require('node-cron');
require('date-utils');
/*
sch_array = [
    {
        name : 'CLEAN WAV FILES',
        time : {
            hour : 5,
            min : 12,
            sec : 18,
        },
        command : 'curl -d \'mode=clean_wav\' http://localhost/command'
    },

]
*/
function isBetween(target, dateStart, dateEnd) {
    const de = dateEnd.getHours() * 3600 + dateEnd.getMinutes() * 60 + dateEnd.getSeconds();
    const ds = dateStart.getHours() * 3600 + dateStart.getMinutes() * 60 + dateStart.getSeconds();
    const dt = target.hour * 3600 + target.min * 60 + target.sec;
    return (ds <= dt && dt < de);
}
function setNodeCrontab() {
    /*
    // Tomorrow Schedule
    cron.schedule('0 0 20 * * *', async () => {
        let dts = Date.Today;
        let dte = Date.Tomorrow;
        let g = await gh.getCalJson(dts, dte);
        getCalJsonReturnToText(g, "あした");
        console.log(g);
    });
    */
    // WatchCalender
    //cron.schedule('10 */5 * * * *', async () => {
    //    let dts = new Date().add({ "minutes": 30 });
    //    let dte = new Date().add({ "minutes": 35 });
    //    console.log(dts);
    //    console.log(dte);
    //
    //    let g = await gh.getCalJson(dts, dte);
    //
    //    console.log(g);
    //});
    // WatchCalender
    //cron.schedule('10 */5 * * * *', async () => {
    //    let dts = new Date().add({ "minutes": 30 });
    //    let dte = new Date().add({ "minutes": 35 });
    //    console.log(dts);
    //    console.log(dte);
    //
    //    let g = await gh.getCalJson(dts, dte);
    //
    //    console.log(g);
    //});
    cron.schedule('18 12 5 * * *', () => {
        //{ "mode": "system_command", "command" : "sudo systemctl restart pi_server" }
        const command = 'curl -d \'mode=clean_wav&short_return=1\' http://localhost/command';
        exec(command, (err, stdout, stderr) => __awaiter(this, void 0, void 0, function* () {
            slk.slacksend(command);
            if (err) {
                slk.slacksend(err);
            }
            else {
                console.log(`stdout: ${stdout}`);
                slk.slacksend(stdout);
            }
        }));
    });
    cron.schedule('18 12 3 * * *', () => {
        const command = 'curl -d \'mode=system_command&command=sudo systemctl restart pi_server\' http://localhost/command';
        exec(command, (err, stdout, stderr) => __awaiter(this, void 0, void 0, function* () {
            slk.slacksend(command);
            if (err) {
                slk.slacksend(err);
            }
            else {
                console.log(`stdout: ${stdout}`);
                slk.slacksend(stdout);
            }
        }));
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        let currentTime = new Date();
        let prevTime = new Date();
        let currentTime_f;
        let prevTime_f;
        for (;; yield ut.delay_ms(48123)) {
            prevTime = currentTime;
            currentTime = new Date();
            prevTime_f = currentTime_f;
            currentTime_f = currentTime.toFormat('YYYY-MM-DD HH24:MI:SS');
            /*
            // テスト時のみ
            if(!process.env.COMPUTERNAME.startsWith('PI'))
            {
                for(let i=0; i<sch_array.length; i++){
                    let res = isBetween(sch_array[i].time, prevTime, currentTime);
                    if(res){
                        exec(sch_array[i].command, (err, stdout, stderr) => {
                            slk.slacksend(sch_array[i].command);
                            if (err) {
                                slk.slacksend(err);
                            }else{
                                console.log(`stdout: ${stdout}`)
                                slk.slacksend(stdout);
                            }
                        });
                    }
                }
            }
            */
        }
    });
}
exports.setNodeCrontab = setNodeCrontab;
//exports.start = start;
//# sourceMappingURL=scheduler.js.map