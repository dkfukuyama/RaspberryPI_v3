﻿import { GoogleHomeController, IGoogleHomeSeekResults } from "@/GoogleHomeController";
import { AppConf } from "@/AppConf";

type IPFunc = (req: any, res: any) => Promise<any>;

interface IPage
{
    name?: string;
    path: string;
    title: string;
    title2?: string | undefined;
    level?: number | undefined;
    view_page?: string | undefined;
    hidden?: boolean | undefined;
    postfunc?: IPFunc | undefined;
    getfunc?: IPFunc | undefined;
};

export class PageParameters {
    Common: {
        ghomeSpeakers: IGoogleHomeSeekResults[];
        server_ws: string;
    };

    UpdateCommon() {
        this.Common = {
            ghomeSpeakers: GoogleHomeController.gHomeAddresses,
            server_ws: `ws://${AppConf().httpDir0}:${process.env.SOCKETIO_PORT}`
        }
    }

    Pages: IPage[] =
    [
        {
            path: '/',
            title: 'こんにちは、ぐーぐるさんだよ',
            level: 0
        },
        {
            path: '/play_music',
            title: 'おんがくをかける',
            view_page: './play_music.ejs',
            level: 0,
        },
        {
            path: '/speak',
            title: 'しゃべらせたいとき',
            view_page: './speak.ejs',
            level: 0,
        },
        {
            path: '/calculator',
            title: 'でんたく',
            view_page: './calculator.ejs',
            level: 0,
        },
        {
            path: '',
            title: 'クイズゲーム',
            view_page: './quiz.ejs',
            level: 0
        },
        {
            path: '/quiz/play',
            title: 'あそぶ',
            title2: 'クイズゲームであそぶ',
            view_page: './quiz.ejs',
            level: 1
        },
        {
            path: '/quiz/make',
            title: 'つくる',
            title2: 'クイズゲームをつくる',
            view_page: './quiz.ejs',
            level: 1
        },
        {
            path: '/config',
            title: 'かんり、せってい',
            view_page: './config.ejs',
            level: 0,
        },
    ];
};


