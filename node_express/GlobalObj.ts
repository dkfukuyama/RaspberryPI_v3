import path = require('path');
import { Slack } from '@/SlackSend';
export const slk = new Slack(process.env.SLACK_WEBHOOK);


const express = require("express");
const favicon = require('express-favicon');
const bodyParser = require('body-parser');

export const App = express();

App.use(favicon(path.join(__dirname, '/views/ico/favicon.png')));
App.use(bodyParser.urlencoded({
    extended: true
}));
App.use(express.json());

// テンプレートエンジンの指定
App.set("view engine", "ejs");
