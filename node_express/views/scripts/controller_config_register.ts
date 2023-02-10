declare const alert: (any) => void;
declare const post_command: (a: any, b: any, c: any) => Promise<any>;

type IFiles = { [key: number]: { sortkey: number; fullpath: string } };

function res_func(obj: any, debug_alert?: boolean) {
	if (debug_alert) alert(JSON.stringify({ res_func: obj }, null, 2));
}

async function LoadAll(debug_alert?: boolean): Promise<IFiles>{
	var getdata = await post_command('/command', {
		alert_text: debug_alert ? 'SQLを読み出します。' : '',
		mode: 'sqldata',
		data: {
			mode: 'load',
			tableName: 't_musicshortcut',
		},
		no_consolelog: true,
		short_return: true,
	}, (str) => res_func(str, debug_alert));

	let obj: { id: number; sortkey: number; fullpath: string }[] = getdata.Obj;
	let Files: IFiles = {};
	for (let i:number = 1; i <= 9; i++){
		let f = obj.filter(o => o.id == i);
		let e = (f.length == 0) ? { sortkey: i, fullpath: '' } : { sortkey: f[0].sortkey, fullpath: f[0].fullpath };
		Files[i] = e;
	}

	return Files;
}

function buildSaveData(paths: { [i: number]: string }): IFiles {

	let return_val: IFiles = {};
	Object.keys(paths).forEach(i => {
		return_val[i] = { sortkey: i, fullpath: paths[i] };
	})

	return return_val;
}

async function Save(data: IFiles, debug_alert?: boolean) {
	await post_command('/command', {
		alert_text: debug_alert ? 'SQLに記録します': '',
		mode: 'sqldata',
		data: {
			mode: 'save',
			tableName: 't_musicshortcut',
			data_to_save: data,
		},
		no_consolelog: true,
		short_return: true,
	}, res_func);
}

