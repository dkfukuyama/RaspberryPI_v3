declare const document: any;
declare const XMLHttpRequest: any;

function post_command(path: string, command_param: string, response_func: (path: string) => void) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', path);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.responseType = 'text';

	xhr.onreadystatechange = function(){
	if(xhr.readyState === XMLHttpRequest.DONE) {
	// XMLデータ取得
	let data = JSON.parse(xhr.responseText);
		try {
			response_func(data);
		} catch (err) {
			response_func(err);
			}
		}
	}
	xhr.send(JSON.stringify(command_param));
}
