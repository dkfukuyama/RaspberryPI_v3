import { Slack } from '@/SlackSend';

const slk = new Slack(process.env.SLACK_WEBHOOK);
slk.Log("test _ send ");