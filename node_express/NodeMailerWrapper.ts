export interface IMailAttathment {
    filename: string; path: any;
}
export type IMailAttachments = IMailAttathment[] | null;

export class NodeMailer {
    private mail_from: string;
    private mail_pass: string;

    private mailer: any = require("nodemailer");

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
        attachments: IMailAttachments;
    }

    constructor(_mail_from: string, _mail_pass: string) {
        this.mail_from = _mail_from;
        this.mail_pass = _mail_pass;
        this.smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // SSL
            auth: {
                user: this.mail_from,
                pass: this.mail_pass
            }
        }
        this.transporter = this.mailer.createTransport(this.smtpConfig);
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
    SendTextAndAttachment(subject, text, attachments: IMailAttachments) {
        let senddata = this.data;
        senddata.subject = subject;
        senddata.text = text;
        senddata.attachments = attachments;
        this.transporter.sendMail(senddata, this.sendCallBack);
    }

    sendCallBack(err, info){
        if (err) {
            console.log("send mail ERROR : ");
            console.error(err);
        } else {
            console.log("send mail OK : ");
            console.log(info);
        }
    }
};


