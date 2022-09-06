const fs = require('fs');
import path = require('path');
const slk: any = require('@/SlackSend');

import { globalVars } from '@/variables';


function clean_wav(leftnum) {

    let dir = globalVars().saveDir;
    console.log(dir);
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        var fileList = [];
        files.filter(function (file) {
            let f = path.join(dir, file);
            return fs.statSync(f).isFile() && /.*\.wav$/.test(file); 
        }).forEach(function (file) {
            fileList.push(path.join(dir, file));
        });
        fileList.sort((a,b)=>{
            //at = fs.statSync(a).atime;
            //bt = fs.statSync(b).atime;

            if (a<b) {
                return -1;
            }else if (a>b) {
                return 1;
            }
            // a は b と等しいはず
            return 0;
        });
        let n = fileList.length - leftnum;
        n = (n < 0 ? 0 : n);
        console.log(n);
        fileList.slice(0, n).forEach(f0 => {
            console.log(f0);
            try {
                fs.unlinkSync(f0);
                console.log('DELETED');
            } catch (error) {
                console.log("ERROR : " + JSON.stringify(error));
                return { message: "ERROR : " + JSON.stringify(error) };
            }
        });
    });

    slk.slacksend(`CLEAN WAV OK`);

    return { message: `CLEAN WAV OK`};
}

exports.clean_wav = clean_wav;