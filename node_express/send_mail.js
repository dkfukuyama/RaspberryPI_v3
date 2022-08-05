const mailer = require("nodemailer");
const vars = require('./variables');

class NodeMailer {
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
            from : this.mail_from,
            to : this.mail_from
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

/*
function test(){
    const mail = new NodeMailer();
    mail.SendText('たいとるだよ', 'ほんぶんだよ');
}

test();
*/
