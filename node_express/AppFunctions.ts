import { Socket, Server } from 'socket.io';
import express from 'express';
import { slk } from '@/AppConf';

interface IAppFunctions_0 {
    [key: string]: (params: any, res: express.Response | null, next: express.NextFunction | null) => object|string;
};

export type IAppFunctions = IAppFunctions_0 | null;
export const AppFunctions: IAppFunctions = {
    //'play_music': 
};

export function ApplyToExpress(expApp: express.Express): express.Express {
    expApp.post('/command', function (req: express.Request, res: express.Response, next: express.NextFunction) {

        let body: {
            mode: string
        } = req.body;
        slk.Log("COMMAND MODE by HTTP");
        if (req.body.mode && AppFunctions[body.mode]) {
            AppFunctions[body.mode](body, res, next);
        }
    });

    return expApp;
}

export function ApplyToSocket(socket: Socket): Socket {
    Object.keys(AppFunctions).forEach(p => {
        slk.Log("COMMAND MODE by Socket.IO");

        socket.on(p, (data) => {
            const res = AppFunctions[p](data, null, null);
            socket.emit(p, res);
        });
    })
    return socket;
}
