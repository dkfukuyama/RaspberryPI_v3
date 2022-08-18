const { IncomingWebhook } = require("@slack/webhook");

let webhook = null;

export async function slacksend(text: object|string) {
    return slacksend_sub(text, console.log)
};

export async function slacksend_er(text: object | string) {
    return slacksend_sub(text, console.error)
};

async function slacksend_sub(text: object | string, extra_send_func: (string) => void )
{
    try {
        webhook ??= new IncomingWebhook(process.env.SLACK_WEBHOOK);

        let send_txt: string;
        if (typeof (text) == "object") send_txt = JSON.stringify(text, null, " \t");
        else send_txt = text;
        await webhook.send({
            text: send_txt,
            channel: "#general"
        });
        extra_send_func(send_txt);
    } catch {
        console.error(`SLACK WEBHOOK ERROR -- ${text}`);
    }
};
