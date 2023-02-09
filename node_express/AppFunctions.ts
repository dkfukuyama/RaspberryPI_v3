import { Socket, Server } from 'socket.io';
import express from 'express';
import { AppConf, GetStandardFileName, GetStandardFileNames, slk } from '@/AppConf';
import path = require('path');

import { GHomeMonitor } from '@/GHomeMonitor';
import { GoogleHomeController, IAppFunctionArgs_GHomeCntData, IAppFunctionArgs_PlayMusicData } from '@/GoogleHomeController';
import { GoogleTTS } from '@/GoogleTTS';
import { ExecChain } from '@/UtilFunctions';

import { read_all, update } from '@/DataBaseOperation';

//import { HttpServer, HttpsServer } from '@/GlobalObj';

export const Monitor = new GHomeMonitor(parseInt(process.env.SOCKETIO_PORT));

const exec = require('child_process').exec;

type IAppFunctionData = any;

export type IAppFunctionArgs = {
	mode: string;
	no_consolelog?: boolean;
	data: IAppFunctionData;
} 

export type IAppFunctionResults = {
    Args: object,
    CommandTerminationType: 'OK' | 'ERROR',
    ErrorMessage?: string,
    Obj?: any,
}

export interface IAppFunctions_0 {
    [key: string]: (params: IAppFunctionData) => Promise<IAppFunctionResults>;
};

/*
 POWERSHELL SEND
$url = "http://192.168.1.231/command";
$postdata = @{
mode='ghome_cnt_volume';
data=@{
Volume_0_100= "20";
SpeakerAddress="192.168.1.20";
}
};
$body = [System.Text.Encoding]::UTF8.GetBytes(($postdata|ConvertTo-Json));
Invoke-WebRequest -Method POST -Uri $url -Body $body -ContentType 'application/json';
 
*/

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
	'sqldata': async (params: IAppFunctionData) => {
		return new Promise(async (resolve, reject) => {
			if (params.mode == 'load') {
				await read_all(params.tableName).then(data =>
					resolve({
						Args: params,
						Obj: data,
						CommandTerminationType: 'OK',
					}))
					.catch(err => {
						reject(err)
					})
			} else if (params.mode == 'save') {
				console.log(JSON.stringify(params.data_to_save, null, 3));
				await update(params.tableName, params.data_to_save).then(data =>
					resolve({
						Args: params,
						Obj: data,
						CommandTerminationType: 'OK',
					}))
					.catch(err => {
						reject(err)
					})
			} else {
				reject(`mode : "${params.mode}" is invalid`);
			}
		});
	},
	'play_music': async (params: IAppFunctionData) => {
		return new Promise((resolve, reject) => {
			try {
				let params_cast: IAppFunctionArgs_PlayMusicData = params as IAppFunctionArgs_PlayMusicData;
				let g = Monitor.GetGhObjByAddress(params_cast.SpeakerAddress)?.g;
				if (g) {
					g.PlayList(params_cast.Media, params_cast.SoxConfig, params_cast.PlayOption);
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
	'ghome_cnt_volume': async (params: IAppFunctionData) => {
		return new Promise((resolve, reject) => {
			try {
				let params_cast: IAppFunctionArgs_GHomeCntData = params as IAppFunctionArgs_GHomeCntData;
				let g = Monitor.GetGhObjByAddress(params_cast.SpeakerAddress)?.g;
				console.log(params_cast);
				if (g) {
					let cb_results: string;
					g.SetVolume(params_cast.Volume_0_100, (d) => cb_results = JSON.stringify(d));
					resolve({
						Args: params,
						Obj: cb_results,
						CommandTerminationType: 'OK',
					});
				} else {
					reject(`Speaker with IP Address ${params_cast.SpeakerAddress} is not Found`);
				}
			} catch (err) {
				reject(err);
			}
		});
	},
    'update_reboot': async (params: IAppFunctionData) => {
		return new Promise(async (resolve, reject) => {
			let k = await ExecChain([
				"git checkout master",
				"git fetch origin master",
				"git reset --hard origin/master",
				() => { process.chdir('../slack_hubot'); return "dir : slack_hubot" },
				'tsc --build', () => { process.chdir('../node_express'); return "dir : slack_hubot" },
				"npm install",
				"npm run build"
			]);
			setTimeout(() => process.exit(0), 5000);
			resolve({
                Args: params,
                Obj: k,
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
	'rec_voice': async (params: IAppFunctionData) => {
		console.log('rec_voice');
		return new Promise(async (resolve, reject) => {
			const RecCommand = AppConf().RecCommandLine;
			const Replace = AppConf().RecCommandLineReplacer;
			const OutFiles = GetStandardFileNames({ dir: [AppConf().recDir, ''], ext: ".wav" });
			const Length = params.length ?? "5";
			let p = RecCommand.replace(new RegExp(Replace.outfile), OutFiles[0]).replace(new RegExp(Replace.length), Length);
			console.log('rec_voice');
			console.log(p);
			await new Promise((resolve0, reject0) => {
				exec(p, { shell: true }, (err, stdout, stderr) => {
					if (err) {
						reject0(err);
					} else {
						console.log(`stdout: ${stdout}`)
						resolve0(stdout.split("\n"));
					}
				});
			}).then(k => {
				let g = Monitor.GetGhObjByAddress(params.SpeakerAddress)?.g;
				if (g) {
					g.PlayList([`${AppConf().httpDir}/${OutFiles[1]}`], null, { RepeatMode: 'REPEAT_OFF' });
				} else {
					throw `Speaker with IP Address ${params.SpeakerAddress} is not Found`;
				}
				return k;
			}).then(k => {
				resolve({
					Args: params,
					Obj: {
						message: k, OutFileName: OutFiles
					},
					CommandTerminationType: 'OK',
				});
			}).catch(err => {
				resolve({
					Args: params,
					Obj: { OutFileName: OutFiles },
					CommandTerminationType: 'ERROR',
					ErrorMessage: err
				});
			});
		});
	},
	'text_to_speech': async (params: IAppFunctionData) => {
		console.log('text_to_speech');
		return new Promise(async (resolve, reject) => {
			const OutFiles = GetStandardFileNames({ dir: [AppConf().recDir, ''], ext: ".wav" });
			console.log(OutFiles);
			await GoogleTTS.GetTtsAudioData({
				outfilePath: OutFiles[0], text: params.Text ?? '入力エラー',
				voiceTypeId: 0
			}).then(() => {
				let g = Monitor.GetGhObjByAddress(params.SpeakerAddress)?.g;
				if (g) {
					g.PlayList([`${AppConf().httpDir}/${OutFiles[1]}`], null, { RepeatMode: 'REPEAT_OFF' });
				} else {
					throw `Speaker with IP Address ${params.SpeakerAddress} is not Found`;
				}
			}).then(() => {
				resolve({
					Args: params,
					Obj: {
						OutFileName: OutFiles
					},
					CommandTerminationType: 'OK',
				})
			}).catch(err => resolve({
				Args: params,
				Obj: { OutFileName: OutFiles },
				CommandTerminationType: 'ERROR',
				ErrorMessage: err
			}));
		});
	},
    'system_command': async (params: IAppFunctionData) => {
        return new Promise(async (resolve, reject) => {
            let p = params.command;
            await new Promise((resolve0, reject0) => {
                exec(p, { shell: true }, (err, stdout, stderr) => {
                    if (err) {
                        reject0(err);
					} else {
						if (!params.log_output_off) console.log(`stdout: ${stdout}`);
                        resolve0(stdout.split("\n"));
                    }
                });
            }).then(k => {
                resolve({
                    Args: params,
                    Obj: k,
                    CommandTerminationType: 'OK',
                });
            }).catch(err => {
                resolve({
                    Args: params,
                    Obj: err,
                    CommandTerminationType: 'ERROR',
                });
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
                    console.error(err);
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
		if (!body.no_consolelog) {
			console.log(JSON.stringify(results, null, "\t"));
		}
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
			//if (!body.no_consolelog) {
			//	console.log(JSON.stringify(results, null, "\t"));
			//}
            socket.emit(p, results);
            await new Promise<void>((resolve) => setTimeout(()=>resolve(), 1000));
            socket.disconnect();
        });
    })
    return socket;
}
