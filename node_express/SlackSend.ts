import { IncomingWebhook } from '@slack/webhook';

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
