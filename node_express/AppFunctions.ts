import { Socket, Server } from 'socket.io';
import express from 'express';
import { slk } from '@/AppConf';

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
