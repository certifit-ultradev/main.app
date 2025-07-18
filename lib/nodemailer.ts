import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const OAuth2 = google.auth.OAuth2;

export const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.OAUTH_CLIENT_ID,
        process.env.OAUTH_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.OAUTH_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject('Failed to create access token :(');
            }
            resolve(token);
        });
    });

    console.log('Access Token:', accessToken);

    const smtpConfig: SMTPTransport.Options = {
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_SENDER as string,
            clientId: process.env.OAUTH_CLIENT_ID as string,
            clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN as string,
            accessToken: accessToken as string
        },
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    return transporter;
};