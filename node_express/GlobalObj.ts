import path = require('path');
import { GoogleHomeController, ISoxConfig } from '@/GoogleHomeController';
import { AppConf, slk } from '@/AppConf';
import { ApplyToExpress } from '@/AppFunctions';

import { PageParameters } from '@/PagesAndCommands';

import express from 'express';
const favicon = require('express-favicon');
const bodyParser = require('body-parser');

const App: express.Express = express();

const fs = require('fs');
const https = require('https');
const http = require('http');
const options = {
	key: fs.readFileSync('../express_key/ca.key'),
	cert: fs.readFileSync('../express_key/ca.crt')
};
export const HttpsServer = https.Server(options, App);
export const HttpServer = http.Server(App);

App.use(favicon(path.join(__dirname, '/views/ico/favicon.png')));
App.use(bodyParser.urlencoded({
    extended: true
}));
App.use(express.json());

// テンプレートエンジンの指定
App.set("view engine", "ejs");

ApplyToExpress(App);

const PageParams = new PageParameters

PageParams.Pages.forEach(p => {

    if (PageParams.PageFunctions.Post[p.path]) {
        App.post(p.path, async function (req: express.Request, res: express.Response, next: express.NextFunction) {
            console.log('postfunc');
            console.log(req.body);

            //t er_occurred = false;
            const pfunc_results = await PageParams.PageFunctions.Post[p.path](req, res).catch(err => {
                //er_occurred = true;
                return err;
            });
            console.log(" ----- POST pfunc_results ----- ");
            console.log(pfunc_results);
            if (req.body.short_return) {
                let send_obj = null;
                if (typeof (pfunc_results) == "object") {
                    send_obj = pfunc_results;
                } else {
                    send_obj = {
                        results: pfunc_results,
                    }
                }
                res.json(pfunc_results);
                res.end();
            } else {
                next();
            }
        });
    }
    if (PageParams.PageFunctions.Get[p.path]) {
        App.get(p.path, async function (req: express.Request, res: express.Response, next: express.NextFunction) {
            console.log('getfunc');
            console.log(req.query);

            //let er_occurred = false;
            const pfunc_results = await PageParams.PageFunctions.Post[p.path](req, res).catch(er => {
                //er_occurred = true;
                return JSON.stringify(er);
            });
            console.log(" ----- GET pfunc_results ----- ");
            console.log(pfunc_results);
            if (req.body.short_return) {
                res.json(pfunc_results);
                res.end();
            } else {
                next();
            }
        });
	}

	App.all(p.path, function (req, res) {
        try {
            let data = {
                page: p,
                items: null
            };
            // レンダリングを行う
            PageParams.UpdateCommon();
            res.render("./index.ejs", {
                data: data,
                prevPostData: req.body,
                query: req.query,
                pages: PageParams.Pages,
				common: PageParams.Common,
            });

        } catch (er) {
            console.log('CATCH ERROR');

            let data = {
                title: p.title,
                view_page: p.view_page,
                errors: er
            };

            res.render("./ER/error.ejs", data);
        }
    });
});


// テストファイルをぞのまま出力するもの
App.all("/__ftest__/*.*", function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const p = { root: path.join(__dirname, "FunctionTest") };
    res.sendFile(req.path.replace("/__ftest__/", ""), p, (err) => {
        if (err) {
            next(err);
        }
    });
});
// テストファイルをぞのまま出力するもの
App.all("/__utest__/*.*", function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const p = { root: path.join(__dirname, "UnitTest") };
    res.sendFile(req.path.replace("/__utest__/", ""), p, (err) => {
        if (err) {
            next(err);
        }
    });
});

// 指定ファイルをぞのまま出力するもの
App.all("*.css|*.js|*.html", function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const p = { root: path.join(__dirname, "views") };
    res.sendFile(req.path, p, (err) => {
        if (err) {
            next(err);
        }
    });
});

type IQuery = {
    sox: string;
    effects: string;
    effectsPreset: string;
}
interface ExRequest extends express.Request {
    query: IQuery;
}

App.get("*.mp4|*.wma", function (req: express.Request, res: express.Response, next: express.NextFunction) {
	const p = path.join(AppConf().saveDir0, decodeURI(req.path));
	res.sendFile(p, (err) => {
		if (err) {
			next(err);
		}
	});
});

App.get("*.wav|*.mp3", function (req: express.Request, res: express.Response, next: express.NextFunction) {
	const fs = require('fs');

	const p = path.join(AppConf().saveDir0, decodeURI(req.path));
	const query: IQuery = (req as ExRequest).query;

	if (!query.sox) {
		res.sendFile(p, (err) => {
			if (err) {
				next(err);
			}
		});
	} else {
		try {
			fs.stat(p, (err, stat) => {
				if (err) {
					next(err)
				}
				// ファイル名をエンコードする
				const basename = path.basename(p);
				const filename = encodeURIComponent(basename);

				// ヘッダーセットする
				res.setHeader('Content-Type', 'audio/wav');
				res.setHeader('Content-disposition', `inline; filename*=utf-8''${filename}`);
				const { spawn } = require('node:child_process');

				const soxConf: ISoxConfig = GoogleHomeController.SoxConfUrlDecode(query);
				const command = GoogleHomeController.BuildSoxCommand(p, soxConf);
				console.log(command);
				let sp = spawn(command, [], { shell: true, timeout: 30000 });
				sp.on('error', (err) => {
					next(err);
					sp.kill();
				});
				sp.on('close', (err) => {
					console.log('spawn close');
				});
				sp.stdout.pipe(res).on('error', (err) => {
					sp.kill();
					slk.Err(err);
				});
				res.on('close', ()=> {
					console.log('the response has been sent');
					setTimeout(() => {
						if (sp) if (!sp.killed) { sp?.kill(); }
					}, 30000);
				});
            });
        } catch (err) {
            next(err);
        }
    }
});

App.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`404 NOT FOUND ERROR : ${req.path}`);
    res.status(404);
    res.render("./ER/404.ejs", { path: req.path, pages: PageParams.Pages });
});

App.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.status);
    res.render("./ER/500.ejs", { path: req.path, pages: PageParams.Pages });
})
