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
    }
    async SendTextAsync(subject, text): Promise<object> {
        return this.SendTextAndAttachmentsAsync(subject, text, null);
    }
    async SendTextAndAttachmentsAsync(subject, text, attachments: IMailAttachments): Promise<object> {
        const os = require("os");
        return new Promise((resolve, reject) => {
            let senddata = this.data;
            senddata.subject = subject;
            senddata.text = text;
            senddata.attachments = attachments;
            this.transporter.sendMail(senddata, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            });
        });
    }
};


