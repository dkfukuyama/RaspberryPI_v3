import { Slack } from '../slacksend';

const slk = new Slack(process.env.SLACK_WEBHOOK);
slk.Log("test _ send ");