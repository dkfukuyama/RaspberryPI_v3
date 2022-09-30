const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
function getLocalAddress() {
    let ifacesObj = {};
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = require('os').networkInterfaces();
    for (let dev in interfaces) {
        interfaces[dev].forEach(function (details) {
            var _a;
            if (!details.internal) {
                let add0 = (_a = details === null || details === void 0 ? void 0 : details.address) !== null && _a !== void 0 ? _a : '';
                switch (details.family) {
                    case 4:
                    case "IPv4":
                        ifacesObj.ipv4.push({ name: dev, address: add0 });
                        break;
                    case 6:
                    case "IPv6":
                        ifacesObj.ipv6.push({ name: dev, address: add0 });
                        break;
                }
            }
        });
    }
    return ifacesObj;
}
;
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
        }
        catch (_a) {
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
                catch (_a) {
                    res.reply(xmlHttpRequest.responseText);
                }
            }
        };
    });
};
//# sourceMappingURL=base00.js.map