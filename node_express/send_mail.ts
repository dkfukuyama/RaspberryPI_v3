const mailer :any = require("nodemailer");
const vars: any = require('./variables');

class NodeMailer {
    private mail_from: string;
    private cmtpConfig: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    private smtpConfig: {
        host: string;
        port: number;
        secure: boolean; // SSL
        auth: { user: string; pass: any; };
    };
    transporter: any;
    data: {
        text: string;
        subject: string;
        from: string;
        to: string; 
        attachments: { filename: string; path: any; }[];    } | null;

    constructor() {
        this.mail_from = vars.globalVars().gmail_addr;
        this.smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // SSL
            auth: {
                user: this.mail_from,
                pass: vars.globalVars().gmail_pass
            }
        }
        this.transporter = mailer.createTransport(this.smtpConfig);
        this.data = {
            text: '',
            subject: '',
            from : this.mail_from,
            to: this.mail_from,
            attachments: null
        }
        console.log(this.smtpConfig);
    }
    SendText(subject, text) {
        let senddata = this.data;
        senddata.subject = subject;
        senddata.text = text;
        console.log(senddata);
        this.transporter.sendMail(senddata, this.sendCallBack);
    }
    SendTextAndAttachment(subject, text, att_path) {
        let senddata = this.data;
        senddata.subject = subject;
        senddata.text = text;
        senddata.attachments = [
            {
                filename: 'att.wav',
                path: att_path
            }
        ];
        this.transporter.sendMail(senddata, this.sendCallBack);
    }

    sendCallBack(err, info){
        if (err) {
            console.log("send mail ERROR : ");
            console.log(err);
        } else {
            console.log("send mail OK : ");
            console.log(info);
        }
    }
};

exports.NodeMailer = NodeMailer;

