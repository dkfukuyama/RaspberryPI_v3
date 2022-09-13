import { Socket, Server } from 'socket.io';
import express from 'express';

interface IAppFunctions_0 {
    [key: string]: (args: object) => string;
};

export type IAppFunctions = IAppFunctions_0 | null;
export const AppFunctions: IAppFunctions = null;

export function ApplyToExpress(expApp: express.Express): any {
    expApp.post('/command', function (req: express.Request, res: express.Response, next: express.NextFunction) {

        let body: {
            mode: string
        } = req.body;

        if (req.body.mode && AppFunctions[body.mode]) {
            
        }
    });

    return expApp;
}

export function ApplyToSocket(socket: Socket): Socket {
    return socket;
}
