const exec = require('child_process').exec;
const cron = require('node-cron');
const ut = require('@/UtilFunctions');
import gh = require('@/google_home');

import { slk } from '@/AppConf';

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

function isBetween(target, dateStart, dateEnd){
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

    cron.schedule('18 12 3 * * *', () => {
        slk.Log("Scheduler Executed");
        slk.Log(require('./clean').clean_wav(100));
    });

    /*
    cron.schedule('18 12 3 * * *', () => {
        const command = 'curl -d \'mode=system_command&command=sudo systemctl restart pi_server\' http://localhost/command';
        exec(command, async (err, stdout, stderr) => {
            slk.Log(command);
            if (err) {
                slk.Err(err);
            } else {
                console.log(`stdout: ${stdout}`)
                slk.Log(stdout);
            }
        });
    });
    */
}

async function start(){

    let currentTime : any = new Date();
    let prevTime : any = new Date();
    let currentTime_f : any;
    let prevTime_f : any;

    for(;;await ut.delay_ms(48123)){
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
}

exports.setNodeCrontab = setNodeCrontab;
//exports.start = start;
