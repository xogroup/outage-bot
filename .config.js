'use strict';

const config = {
    dynamo: {
        region      : '',         //Fill in your AWS Dynamo Region
        accessKey   : '',         //Fill in your AWS Dynamo Access Key
        accessSecret: '',         //Fill in your AWS Dynamo Access Secret
        table       : 'outagebot' //Change the Dynamo Table Name if you want to
    },
    slack: {
        botToken: '' //Fill in your Slack Bot Token
    },
    googleDrive: {
        oAuth          : '',         //Fill in your Google Drive OAuth Token
        parentFolder   : '',         //Fill in the string for the parent folder on Google Drive where you want reports to be stored
        refreshToken   : '',         //Fill in your Google Drive Refresh Token
        tokenExpiration: 1579629627, //A long time so that the token doesn't expire
        clientId       : '',         //Fill in your Google Drive Client Id (this is a URL)
        clientSecret   : ''          //Fill in your Google Drive Client Secret
    }
};

module.exports = config;