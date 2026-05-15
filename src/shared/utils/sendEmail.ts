import sgMail from '@sendgrid/mail'
import logger from './logger.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface SendEmailType {
    to: string;
    subject?: string;
    text?: string;
    html?: string
}

const sendEmail = async ({ to, subject, text, html }: SendEmailType) => {
    const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject,
        text,
        html
    };

    sgMail
        .send(msg)
        .then((response: any) => {
            logger.info(response[0].statusCode)
            logger.info(response[0].headers)
        })
        .catch((error: any) => {
            logger.error(error)
        })
};