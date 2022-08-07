const { IncomingWebhook } = require("@slack/webhook");

let webhook = null;

export async function slacksend(text) {

  try{
    if(!webhook) webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);

    await webhook.send({
      text: text,
      channel: "#general"
    });
  }catch{
    console.log(`SLACK WEBHOOK ERROR -- ${text}`);
  }
};


