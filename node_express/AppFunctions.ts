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
    'play_music': async (params: IAppFunctionData) => {
        return new Promise((resolve, reject) => {
            let g = Monitor.GetGhObjByAddress(params.Obj.speakeraddress)?.g;
            if (g) {
                g.PlayList([params.Obj.filename]);
                resolve({
                    Args: params,
                    CommandTerminationType: 'OK',
                });
            } else {
                throw new Error(`Speaker with IP Address ${params.Obj.speakeraddress} is not Found`);
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
};

export function ApplyToExpress(expApp: express.Express): express.Express {
    expApp.post('/command', async function (req: express.Request, res: express.Response, next: express.NextFunction) {

        let body: IAppFunctionArgs = req.body;
        slk.Log("COMMAND MODE via HTTP");

        let results: IAppFunctionResults
        if (req.body.mode && AppFunctions[body.mode]) {
            results = await AppFunctions[body.mode](body)
                .catch(err => {
                    slk.Err(err);
                    let temp: IAppFunctionResults = {
                        Args: body,
                        CommandTerminationType: 'ERROR',
                        ErrorMessage: 'Internal Error',
                        Obj: err,
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
        res.json(results);
    });

    return expApp;
}

export function ApplyToSocket(socket: Socket): Socket {
    Object.keys(AppFunctions).forEach(p => {
        slk.Log("COMMAND MODE via Socket.IO");

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
            socket.emit(p, results);
            await new Promise<void>((resolve) => setTimeout(()=>resolve(), 1000));
            socket.disconnect();
        });
    })
    return socket;
}
