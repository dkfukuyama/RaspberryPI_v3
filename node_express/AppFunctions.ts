import { Socket, Server } from 'socket.io';
import express from 'express';
import { slk } from '@/AppConf';

import { GHomeMonitor } from '@/GHomeMonitor';
export const Monitor = new GHomeMonitor(parseInt(process.env.SOCKETIO_PORT));

const exec = require('child_process').exec;

type IAppFunctionData = any;

export type IAppFunctionArgs = {
    mode: string;
    data: IAppFunctionData;
} 

export type IAppFunctionResults ={
    Args: object,
    CommandTerminationType: 'OK' | 'ERROR',
    ErrorMessage?: string,
    Obj?: any,
}

export interface IAppFunctions_0 {
    [key: string]: (params: IAppFunctionData) => Promise<IAppFunctionResults>;
};

export type IAppFunctions = IAppFunctions_0 | null;
export const AppFunctions: IAppFunctions = {
    'test00': async (params: IAppFunctionData) => {
        return new Promise((resolve, reject)=>resolve({
            Args: params,
            CommandTerminationType: 'OK',
        }));
    },
    'clean_wav': async (params: IAppFunctionData) => {
        return new Promise((resolve, reject) => resolve({
            Args: params,
            Obj: Promise.resolve(require('./clean').clean_wav(100)),
            CommandTerminationType: 'OK',
        }));
    },
    'play_music': async (params: IAppFunctionData) => {
        return new Promise((resolve, reject) => {
            try {
                console.log(JSON.stringify(params));
                let g = Monitor.GetGhObjByAddress(params.speakeraddress).g;
                if (g) {
                    g.PlayList([params.filename]);
                    resolve({
                        Args: params,
                        CommandTerminationType: 'OK',
                    });
                } else {
                    reject(`Speaker with IP Address ${params.speakeraddress} is not Found`);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    'update_reboot': async (params: IAppFunctionData) => {
        return new Promise(async (resolve0, reject0) => {
            let pr = ["git checkout master", "git fetch origin master", "git reset --hard origin/master", "npm install", "tsc --build"];
            let k = "";
            for (let p of pr) {
                k += await new Promise((resolve, reject) => {
                    exec(p, (err, stdout, stderr) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log(`stdout: ${stdout}`)
                            resolve(stdout);
                        }
                    });
                });
            }
            setTimeout(() => process.exit(0), 5000);
            resolve0({
                Args: params,
                CommandTerminationType: 'OK',
            });
        });
    },
    'reboot': async (params: IAppFunctionData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => process.exit(0), 5000);
            resolve({
                Args: params,
                CommandTerminationType: 'OK',
            });
        });
    },
    'system_command': async (params: IAppFunctionData) => {
        return new Promise((resolve, reject) => {
            //params.command
            resolve({
                Args: params,
                CommandTerminationType: 'OK',
            });
        });
    },
};

export function ApplyToExpress(expApp: express.Express): express.Express {
    expApp.post('/command', async function (req: express.Request, res: express.Response, next: express.NextFunction) {
        console.log("COMMAND MODE via HTTP");

        let body: IAppFunctionArgs = req.body;
        let results: IAppFunctionResults
        if (req.body.mode && AppFunctions[body.mode]) {
            results = await AppFunctions[body.mode](body.data)
                .catch(err => {
                    slk.Err(err);
                    let temp: IAppFunctionResults = {
                        Args: body,
                        CommandTerminationType: 'ERROR',
                        ErrorMessage: 'Internal Error',
                        Obj: err.toString(),
                    };
                    return temp;
                });
        } else {
            results = 
            {
                Args: body,    
                CommandTerminationType: "ERROR",
                ErrorMessage: "Command not Exists",
            };
        }
        console.log(JSON.stringify(results, null, "\t"));
        res.json(results);
    });

    return expApp;
}

export function ApplyToSocket(socket: Socket): Socket {
    Object.keys(AppFunctions).forEach(p => {
        console.log("COMMAND MODE via Socket.IO");

        socket.on(p, async (data: IAppFunctionData) => {
            console.log(p);
            let results: IAppFunctionResults = await AppFunctions[p](data)
                .catch(err => {
                    slk.Err(err);
                    let temp: IAppFunctionResults = {
                        Args: data,
                        CommandTerminationType: 'ERROR',
                        ErrorMessage: 'Internal Error',
                        Obj: err,
                    };
                    return temp;
                });
            console.log(JSON.stringify(results, null, "\t"));
            socket.emit(p, results);
            await new Promise<void>((resolve) => setTimeout(()=>resolve(), 1000));
            socket.disconnect();
        });
    })
    return socket;
}
