import { Socket, Server } from 'socket.io';

interface IAppFunctions_0 {
    "Key": string;
    "Func": (args: object) => object;
};

export type IAppFunctions = IAppFunctions_0 | null;
export const AppFunctions: IAppFunctions = null;


export function ApplyToExpress(expApp: any): any {
    expApp.all('/command', function (req, res, next) {

    });

    return expApp;
}

export function ApplyToSocket(socket: Socket): Socket {
    return socket;
}

