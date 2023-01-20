declare const document: any;
declare const XMLHttpRequest: any;
declare const alert: any;

interface ICommand {
	alert_text?: string;
	mode: string;
	data: any;
	short_return: boolean;
};

function post_command(path: string, command_param: ICommand, response_func?: (path: string) => void) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', path);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.responseType = 'text';

	if (command_param.alert_text) alert(command_param.alert_text);

	xhr.onreadystatechange = function(){
	if(xhr.readyState === XMLHttpRequest.DONE) {
	// XMLデータ取得
	let data = JSON.parse(xhr.responseText);
		try {
			response_func ?? response_func(data);
		} catch (err) {
			response_func ?? response_func(err);
			}
		}
	}
	xhr.send(JSON.stringify(command_param));
}
