import express from 'express';

import { GoogleHomeController, IGoogleHomeSeekResults, PlayOptionSelector } from "@/GoogleHomeController";
import { AppConf } from "@/AppConf";
import { GoogleTTS } from '@/GoogleTTS';
import { FileListSearch } from '@/FileListSearch';
import path = require('path');

type IPFunc = (req: express.Request, res: express.Response) => Promise<object|string>;

interface IPage
{
    name?: string;
    path: string;
    title: string;
    title2?: string | undefined;
    level?: number | undefined;
    view_page?: string | undefined;
	hidden?: boolean | undefined;
	specialParams?: any;
};

interface PreExecFunctions {
    Post: {
        [key: string]: IPFunc
    };
    Get: {
        [key: string]: IPFunc
    };
}

export class PageParameters {
	Common: {
		ghomeSpeakers: IGoogleHomeSeekResults[];
		server_ws: string;
		useSocketIoExpress: boolean;
	};

	UpdateCommon() {
		this.Common = {
			ghomeSpeakers: GoogleHomeController.gHomeAddresses,
			server_ws: `ws://${AppConf().httpDir0}:${process.env.SOCKETIO_PORT}`,
			useSocketIoExpress: AppConf().UseSocketIoExpress,
		}
	};

	
	UpdateSpecialParams: { [key: string]: (obj?: any | null) => (any | null); } = {
		'/conf_remocon' : () => {
			const f = new FileListSearch(AppConf().saveDir0, AppConf().httpDir_music);
			f.GetInfo(path.join(AppConf().saveDir0, AppConf().music_shortcut_dir));
			return f.GetList().FileList;
		}
	};

	Pages: IPage[] = [
		{
			path: '/',
			title: 'こんにちは、ぐーぐるさんだよ',
			level: 0,
		},
		{
			path: '/play_music',
			title: 'おんがくをかける',
			view_page: './play_music.ejs',
			level: 0,
			specialParams: {
				HtmlRepeatMode: PlayOptionSelector.GenHtml('RepeatMode', 'くりかえし'),
				HtmlPlayOrder: PlayOptionSelector.GenHtml('PlayOrder', 'じゅんばん'),
				HtmlSoxEffectsPreset: PlayOptionSelector.GenHtml('SoxEffectsPreset', 'とくしゅこうか'),
			}
		},
		{
			path: '/controler_config',
			title: 'リモコンのせってい',
			view_page: './controler_config.ejs',
			level: 0,
			specialParams: {
				GetFunc: ()=>this.UpdateSpecialParams['/conf_remocon'](),
			}
		},
		{
			path: '/voice_changer',
			title: 'ボイスチェンジャー',
			view_page: './voice_changer.ejs',
			level: 0,
		},
		{
			path: '/speak',
			title: 'しゃべらせたいとき',
			view_page: './speak.ejs',
			level: 0,
			specialParams: {
				voiceTypes: GoogleTTS.VoiceType,
			}
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

	PageFunctions: PreExecFunctions = {
		Post : {},
		Get : {},
	}
};


