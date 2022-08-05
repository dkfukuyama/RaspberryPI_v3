import path = require('path');
import { globalVars } from './variables';
const gtts = require('./google_tts')
const gHome = require('./gHomeCnt');
const request = require('request');
const ut = require('./utils');
const execSync = require('child_process').execSync;

function getNowDateWithString(){
    let dt: any = new Date();
    let y = dt.getFullYear();
    let m = ("00" + (dt.getMonth()+1)).slice(-2);
    let d = ("00" + dt.getDate()).slice(-2);
    let h = ("00" + dt.getHours()).slice(-2);
    let min = ("00" + dt.getMinutes()).slice(-2);
    let sec = ("00" + dt.getSeconds()).slice(-2);
    let ms = ("000" + dt.getMilliseconds()).slice(-3);

    let result = `${y}-${m}-${d}_${h}-${min}-${sec}_${ms}`;
    return result;
}

async function speechOnGoogleHome(ghName, params){
    return new Promise(async (resolve, reject)=>{
        try{
            setTimeout(()=>reject('TIMEOUT speechOnGoogleHome'), 120000);
            let path_togo = (params.outFile ?? getNowDateWithString()) + ".wav";
            // 日付時刻から保存パス設定
            params.outfilePath = path.join(vars.globalVars().saveDir, path_togo);

            if(params.reverse_play){
                params.text = params.text.split("").reverse().join("");
            }

            await gtts.getTtsAudioData(params).catch((err)=>reject(err));

            console.log(`params.rb_effects1 = ${params.rb_effects1}`);

            let rb_effects1_array: 
            {
                key: string;
                command: string;
            } []
            = [
                {
                    key: 'hankyo',
                    command: 'reverb 50 50 100'
                },
                {
                    key: 'robot',
                    command: 'chorus 1 1 100.0 1 5 5.0 -s'
                },
                {
                    key: 'yamabiko',
                    command: 'echos 0.8 0.7 40.0 0.25 63.0 0.3'
                }
            ];

            if (params.rb_effects1) {
                rb_effects1_array.forEach(e => {
                    if (e.key == params.rb_effects1) {
                        const outpath2 = params.outfilePath.replace(".wav", "_sox.wav");
                        path_togo = path_togo.replace(".wav", "_sox.wav");
                        const commandLine = `sox ${params.outfilePath} ${outpath2} ${e.command}`;
                        execSync(commandLine);
                        console.log(commandLine);
                    }
                });
            }

            const fullPathUrl = vars.globalVars().httpDir + "/" + path_togo;

            if(ghName) await gHome.play(ghName, fullPathUrl, params).then((d)=>resolve(d)).catch((err)=>reject(err));
            else resolve(params);
        }catch(err){
            reject(err);
        }
    });
}

async function getCalJson(sdate: any = undefined, edate: any = undefined){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>reject('Get Cal Timeout'), 30000);

        var options = {
            url: vars.globalVars().g_calenderSummaryUrl,
            method: 'POST',
            json: true,
            followAllRedirects: true,
            form: {
                startDate:sdate,
                endDate:edate,
            }
        };
        try{
            request(options, function (error, response, body) {
                if(error){
                    reject(error);
                }else{
                    resolve(body);
                }
            });
        }catch(er){
            reject(er);
        }
    });
}

async function getCalDayBetweenJson(date1, date2) {
    let localtime = new Date(Date.now());
    let localdate0 = new Date(localtime.getFullYear(), localtime.getMonth(), localtime.getDate() + date1);
    let localdate1 = new Date(localtime.getFullYear(), localtime.getMonth(), localtime.getDate() + date2 + 1);

    return gtts.getCalJson(
        localdate0.toLocaleDateString().substring(0, 10).split("/").join("-"),
        localdate1.toLocaleDateString().substring(0, 10).split("/").join("-")
    );
}

function getCalJsonReturnToText(g, dayx : any = undefined) {
    const textparams = [
        {
            headerAll: "[day]は[date]。予定のお知らせだよーーん。。",
            headerSchedule: "[i]番目の予定は[shName]だよ。",
            startTime: "開始時刻は[startTime]だよ。",
            noSchedule: "[day]はカレンダーに登録されている予定はないよ。",
            location: "ばしょは[location]だよ"
        },

        {
            headerAll: "[day]は[date]。予定のお知らせだよーーん。だよーーん。だよーーん。",
            headerSchedule: "[i]番目の予定は[shName]だよ～ん。だよ～ん。だよーーん。",
            startTime: "開始時刻は[startTime]だよ～ん。だよ～ん。だよ～ん。",
            noSchedule: "[day]はカレンダーに登録されている予定はないよ～ん。ないよ～ん。",
            location: "ばしょは[location]だよ～ん。だよ～ん。だよ～ん。"
        },

        {
            headerAll: "[day]は[date]。よていのおしらせでござるよ。",
            headerSchedule: "[i]番目の予定は[shName]でござる。",
            startTime: "開始時刻は[startTime]でござる。",
            noSchedule: "[day]はカレンダーに登録されている予定はないでござる。",
            location: "ばしょは[location]でござるよ。"
        },

        {
            headerAll: "[day]は[date]。予定のお知らせやで。",
            headerSchedule: "[i]番目の予定は[shName]やで。",
            startTime: "開始時刻は[startTime]やで。",
            noSchedule: "[day]はカレンダーに登録されている予定はあらへんわ。",
            location: "ばしょは[location]やわ。"
        },

        {
            headerAll: "[day]は[date]でっせ～。予定のお知らせしまっせ～。",
            headerSchedule: "[i]番目の予定は[shName]でっせ～。",
            startTime: "開始時刻は[startTime]でんねん。",
            noSchedule: "[day]はカレンダーに登録されている予定はおまへん！。",
            location: "ばしょは[location]でっせ～～。"
        },

        {
            headerAll: "[day]は[date]だぜ。今日の予定を教えてやるよ。",
            headerSchedule: "[i]番目の予定は[shName]だぜ。",
            startTime: "開始時刻は[startTime]だ。",
            noSchedule: "[day]はカレンダーに登録されている予定はないぜ。",
            location: "ばしょは[location]だぞ。"
        },
    ];


    const textparams0 = textparams[ut.getRandomInt(textparams.length)];
    
    let d = new Date();
    let wd = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()] + "曜日";
    let resultsText = textparams0.headerAll.replace("[date]", `、${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日　${wd}、`).replace("[day]", `、${dayx}、`);
    if (g.events.length == 0) {
        resultsText += textparams0.noSchedule.replace("[day]", dayx);
    } else {
        g.events.forEach((e,i) => {
            resultsText += textparams0.headerSchedule.replace("[i]", i + 1).replace("[shName]", `、${e.Summary}、`);
            if (!e.AllDayEvent) {
                const d = new Date(Date.parse(e.StartTime));
                resultsText += textparams0.startTime.replace("[startTime]", `${d.getHours()}時${d.getMinutes()}分`);
            }
            if (e.Location) {
                resultsText += textparams0.location.replace("[location]", `、${e.Location}、`);
            }
        });
    }
    return resultsText;
}

async function speechOnGoogleHomeCal(ghName, params){
    let stay_loop = true;

    return new Promise(async (resolve, reject)=>{
        for(let i=0; stay_loop && i<10; i++){
            stay_loop = false;
            await getCalJson().then(async (g)=>
            {
                params.text = getCalJsonReturnToText(g);
                params.volume = 80;
                params.voiceTypeId = Math.floor(Math.random() * 4);
                params.pitch = Math.random() * 10 - 5;

                console.log(params.text);
                await speechOnGoogleHome(ghName, params).then(d=>resolve(d)).catch(er=>reject(er));
            }).catch(er=>{
                console.log(er);
                stay_loop = true;
            });
        }
        reject('READ CAL ERROR');
    });
}

exports.getCalJson = getCalJson;
exports.getCalDayBetweenJson = getCalDayBetweenJson;
exports.speechOnGoogleHome = speechOnGoogleHome;
exports.speechOnGoogleHomeCal = speechOnGoogleHomeCal;
