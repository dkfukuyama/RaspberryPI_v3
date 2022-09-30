const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getLocalAddress() {

    let ifacesObj: any = {};
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = require('os').networkInterfaces();

    for (let dev in interfaces) {
        interfaces[dev].forEach(function(details: any) {
            if (!details.internal) {
                let add0: string = details?.address ?? '';
                switch (details.family) {
                    case 4:
                    case "IPv4":
                        ifacesObj.ipv4.push({ name: dev, address: add0 });
                        break;
                    case 6:
                    case "IPv6":
                        ifacesObj.ipv6.push({ name: dev, address: add0 })
                        break;
                }
            }
        });
    }
    return ifacesObj;
};

module.exports = (robot) => {
	robot.hear(/__slack_hubot__(\s*)(.+)/i, (res) => {
		const url = 'http://' + getLocalAddress().ipv4[0].address + '/command';
		// JSONデータのPOST送信
		const xmlHttpRequest = new XMLHttpRequest();
		xmlHttpRequest.open('POST', url);
		xmlHttpRequest.setRequestHeader('Content-Type', 'application/json');
		// データをリクエスト ボディに含めて送信する
		const sendString = res.match[2];
		console.log(sendString);
		var parseResults;
		try {
			parseResults = JSON.parse(sendString);
		} catch {
			parseResults = { data: sendString };
		}
		if (typeof (parseResults) == "number") {
			parseResults = { data: sendString };
		}
		parseResults.short_return = true;
		let sendStringify = JSON.stringify(parseResults);
		xmlHttpRequest.send(sendStringify);
		xmlHttpRequest.onreadystatechange = () => {
			if (xmlHttpRequest.readyState == 4) {
				try {
					const resp = JSON.parse(xmlHttpRequest.responseText);
					res.reply(JSON.stringify(resp, null, 4));
				}
				catch {
					res.reply(xmlHttpRequest.responseText);
				}
			}
		};
	});
}
