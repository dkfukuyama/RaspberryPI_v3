import { GoogleHomeController, IGoogleHomeSeekResults } from "@/GoogleHomeController";
import { globalVars } from "@/variables";

type IPFunc = (req: any, res: any) => Promise<any>;

interface IPage
{
    name?: string;
    path: string;
    title: string;
    title2?: string;
    level?: number;
    view_page?: string;
    hidden?: boolean;
    postfunc?: IPFunc;
};

export class PageParameters {
    Common: {
        ghomeSpeakers: IGoogleHomeSeekResults[];
        server_ws: string;
    };

    UpdateCommon() {
        this.Common = {
            ghomeSpeakers: GoogleHomeController.gHomeAddresses,
            server_ws: `ws://${globalVars().httpDir0}:${process.env.SOCKETIO_PORT}`
        }
    }

    Pages: IPage[] =
    [
        {
            path: '/',
            title: '����ɂ��́A���[���邳�񂾂�',
            level: 0
        },
        {
            path: '/play_music',
            title: '���񂪂���������',
            view_page: './play_music.ejs',
            level: 0,
        },
        {
            path: '/speak',
            title: '����ׂ点�����Ƃ�',
            view_page: './speak.ejs',
            level: 0,
        },
        {
            path: '/calculator',
            title: '�ł񂽂�',
            view_page: './calculator.ejs',
            level: 0,
        },
        {
            path: '',
            title: '�N�C�Y�Q�[��',
            view_page: './quiz.ejs',
            level: 0
        },
        {
            path: '/quiz/play',
            title: '������',
            title2: '�N�C�Y�Q�[���ł�����',
            view_page: './quiz.ejs',
            level: 1
        },
        {
            path: '/quiz/make',
            title: '����',
            title2: '�N�C�Y�Q�[��������',
            view_page: './quiz.ejs',
            level: 1
        },
        {
            path: '/config',
            title: '�����A�����Ă�',
            view_page: './config.ejs',
            level: 0,
        },
        {
            path: '/command',
            title: '',
            hidden: true,
        }
    ];

};


