const nodeMailer = require ('nodemailer');
const { google } = require('googleapis');
const oAuth2 = google.auth.OAuth2;
require('dotenv/config');


// create oAuth2Client for authentication
const oAuth2Client = new oAuth2(
    process.env.clientID,
    process.env.clientSecret,
    process.env.authUrl
);

// set up refresh token
oAuth2Client.setCredentials({
    refresh_token: process.env.refreshToken
});

// get access token to be used in authenticating with GMAIL API
const newAccessToken = oAuth2Client.getAccessToken();

// global variables
let transport, mailObject, mailOptions;

// mail function
exports.mailServer = function (serviceName, data) {
    // serviceName is the name of an action to be performed
    switch (serviceName) {
        case 'register':
            // transport is a nodeMailer object instance
            transport = nodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    type: "OAuth2",
                    clientId: process.env.clientID,
                    clientSecret: process.env.clientSecret,
                    access_type: "offline"
                }
            });

            // check for callback event and log out some information
            transport.on('token', token => {
                console.log('Access Token acquired');
                console.log('User: %s', token.user);
                console.log('Access Token: %s', token.accessToken);
                console.log('Expires in: %s', new Date(token.expires));
            });

            // mail object
            mailObject = {
                // todo::: add email template
                to: data.to,
                from: data.from,
                subject: data.subject,
                message: 'Hello ' + data.firstName + '\nYou have registered on the E.O.S Adinkrah Enterprise',
                htmlMessage: `
                               <strong>Hello ${data.firstName}</strong>
                               <p>You have registered on the E.O.S Adinkrah Enterprise</p>
                               <p>Contiue browsing for more products</p>`
            };

            // parameters for sending email
            mailOptions = {
                from: mailObject.from,
                to: mailObject.to,
                subject: 'Welcome to E.O.S Adinkrah Enterprise',
                text: mailObject.message,
                html: mailObject.htmlMessage,
                auth: {
                    user: "kwabenaampofo5@gmail.com",
                    refreshToken: process.env.refreshToken,
                    accessToken: newAccessToken,
                    expires: 1484314697598
                }
            };

            // send mail
            transport.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err.message.toString());
                    return err
                } else {
                    console.log(info);
                    return 200;
                }
            });
            break;

        case 'orders':
            transport = nodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    type: "OAuth2",
                    clientId: process.env.clientID,
                    clientSecret: process.env.clientSecret,
                    access_type: "offline"
                }
            });
            transport.on('token', token => {
                console.log('Access Token acquired');
                console.log('User: %s', token.user);
                console.log('Access Token: %s', token.accessToken);
                console.log('Expires in: %s', new Date(token.expires));
            });

            mailObject = {
                to: data.to,
                from: data.from,
                subject: data.subject,
                message: 'Dear ' + data.firstName + '\nYou recently purchased: ' + data.productName,
                htmlMessage: `
                    <strong>Dear ${data.firstName}, </strong>
                    <p>You recently purchased ${data.productName} at total cost of GHC: ${data.totalPrice} </p>
                    <p>Thank you for shopping with us</p>
                `
            };

            mailOptions = {
                from: mailObject.from,
                to: mailObject.to,
                subject: mailObject.subject,
                text: mailObject.message,
                html: mailObject.htmlMessage,
                auth: {
                    user: "kwabenaampofo5@gmail.com",
                    refreshToken: process.env.refreshToken,
                    accessToken: newAccessToken,
                    expires: 1484314697598
                },
            };

            transport.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err.message.toString())
                    return err
                } else {
                    console.log(info);
                    return 200;
                }
            });
            break;

        default:
            console.log(`An Error Occurred`);
    }
}
