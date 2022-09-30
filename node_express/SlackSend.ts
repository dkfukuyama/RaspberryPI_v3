import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook';


export class Slack {

    private Webhook: IncomingWebhook|null = null;
	private UserName: string | null = null;

	constructor(webhook_url: string, user_name?: string) {
        this.Webhook = new IncomingWebhook(webhook_url);
		this.UserName = user_name;
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
			if (typeof (text) == "object") send_txt = JSON.stringify(text, null, 2);
			else send_txt = text;

			const userName: string = (this.UserName ?? "") + " " + (process.env.COMPUTERNAME ?? "");
			await this.Webhook.send({
				username: userName,
                text: send_txt,
                channel: "#general"
            });
            extra_send_func(send_txt);
        } catch {
            console.error(`SLACK WEBHOOK ERROR -- ${text}`);
        }
    };
}
