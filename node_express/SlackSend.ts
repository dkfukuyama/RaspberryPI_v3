import { IncomingWebhook } from '@slack/webhook';

import path from 'path'

export class Slack {

    private Webhook: IncomingWebhook|null = null;

    constructor(webhook_url: string) {
        this.Webhook = new IncomingWebhook(webhook_url);
    }

    async Log(text: object | string) {
        return this.slacksend_sub(text, console.log);
    };

    async Err(text: object | string) {
        return this.slacksend_sub(text, console.error);
    };


    private async slacksend_sub(text: object | string, extra_send_func: (string) => void) {
        try {
            let send_txt: string;
            if (typeof (text) == "object") send_txt = JSON.stringify(text, null, " \t");
            else send_txt = text;
            await this.Webhook.send({
                text: send_txt,
                channel: "#general"
            });
            extra_send_func(send_txt);
        } catch {
            console.error(`SLACK WEBHOOK ERROR -- ${text}`);
        }
    };
}


export class SlackApi {

	private fs = require('fs');
	private BotToken: string;
	constructor(botToken: string) {
		this.BotToken = botToken;
	}

	public SendFileAsync(fileName: string): Promise<object> {
		if (this.fs.existsSync(fileName)) {

			return new Promise((resolve, reject) => {

				require('request').post({
					uri: "https://slack.com/api/files.upload",
					headers: {
						"Authorization": `Bearer ${this.BotToken}`,
					},
					formData: {
						channels: "#general",
						filetype: path.extname(fileName),
						filename: fileName,
						file: require('fs').createReadStream(fileName)
					}
				}, function (error: any, response: any, body: any) {
					if (error) {
						resolve(error);
						console.error(error);
						console.debug(body);
					} else {
						try {
							resolve(JSON.parse(response.body));
						} catch {
							reject({ statusCode: response.statusCode, statusMessage: response.statusMessage });
						}
					}
				});
			});

		} else return Promise.reject({ "ok": false, "error": "file not exists", "fileName": fileName });
	}
}
