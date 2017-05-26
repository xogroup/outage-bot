'use strict';

const fs = require('fs');
const Promise = require('bluebird');
const google = require('googleapis');
const config = require('../../.config');
const OAuth2 = google.auth.OAuth2;

const uploadFile = (date, title) => {
    return new Promise((resolve, reject) => {
        //Retrieve an access token
        const oauth2Client = new OAuth2(
            config.googleDrive.clientId,
            config.googleDrive.clientSecret,
            config.googleDrive.oAuth
        );
        const tokens = {
            refresh_token: config.googleDrive.refreshToken,
            token_type   : 'Bearer',
            expiry_date  : config.googleDrive.tokenExpiration
        };
        oauth2Client.setCredentials(tokens);
        const drive = google.drive({version: 'v3', auth: oauth2Client});

        //Set file data
        const fileMetadata = {
            name    : `${date} ${title}`,
            mimeType: 'application/vnd.google-apps.document',
            parents : [config.googleDrive.parentFolder]
        };
        const media = {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            body    : fs.createReadStream(`${__dirname}/../../tmp/output.docx`)
        };

        //Send file to Google Drive
        drive.files.create({
            resource: fileMetadata,
            media   : media
        }, (err, file) => {
            if (err) {
                console.log('Upload File Error: ', err);
                reject('Failed to upload your outage report to Google Docs');
            } else {
                resolve(`https://docs.google.com/document/d/${file.id}/edit`);
            }
        });
    });
};

module.exports = uploadFile;