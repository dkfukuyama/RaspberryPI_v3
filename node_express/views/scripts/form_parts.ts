declare const document: any;
declare const XMLHttpRequest: any;
declare const alert: any;

interface ICommand {
	alert_text?: string;
	mode: string;
	data: any;
	no_consolelog?: boolean;
	short_return?: boolean;
};

export async function post_command(path: string, command_param: ICommand, response_func?: (obj:any) => void): Promise<any> {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open('POST', path);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.responseType = 'text';

		if (command_param.alert_text) alert(command_param.alert_text);

		let t = setTimeout(() => reject({ result: "TIME OUT" }), 5000);

		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				// XMLデータ取得
				let data = JSON.parse(xhr.responseText);
				try {
					if(response_func) response_func(data);
					resolve(data);
				} catch (err) {
					if(response_func) response_func(err);
					reject(err);
				} finally {
					clearTimeout(t);
				}
			}
		}
		xhr.send(JSON.stringify(command_param));
	});
}
