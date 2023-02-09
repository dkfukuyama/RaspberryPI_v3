declare const alert: (any) => void;

declare const post_command: (a: any, b: any, c: any) => Promise<any>;

let Files: { [key: number]: string } = {};


function res_func(obj: any) {
	alert(obj);
}


async function LoadAll(debug_alert?: boolean) {
	await post_command('/command', {
		alert_text: debug_alert ? 'SQLに記録します' : '',
		mode: 'sqldata',
		data: {
			mode: 'save',
			tableName: 't_musicshortcut',
		},
		no_consolelog: true,
		short_return: true,
	}, debug_alert ? res_func: null);
}

function MusicShortCutRegister(num: number, file: string, debug_alert?: boolean) {
	Files[num] = file;

	if (debug_alert) {
		alert(JSON.stringify(Files, null, "4"));
	}
}


async function Save(debug_alert?: boolean) {
	await post_command('/command', {
		alert_text: debug_alert ? 'SQLに記録します': '',
		mode: 'sqldata',
		data: {
			mode: 'save',
			tableName: 't_musicshortcut',
			data_to_save: Files,
		},
		no_consolelog: true,
		short_return: true,
	}, res_func);
}

