'use strict';

const Botkit = require('botkit'),
    helpers = require('./helpers/index'),
    dynamoStorage = require('botkit-storage-dynamodb'),
    config = require('../.config');

let users,
    channels;

if (!config.slack.botToken) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

const configuredStorage = dynamoStorage({
    dynamoRegion      : config.dynamo.region,
    dynamoAccessKey   : config.dynamo.accessKey,
    dynamoAccessSecret: config.dynamo.accessSecret,
    dynamoTable       : config.dynamo.table
});

const controller = Botkit.slackbot({
    storage: configuredStorage
});

controller.spawn({
    token: config.slack.botToken,
    retry: 5
}).startRTM((err, bot, payload) => {
    if (err) {
        throw new Error(err);
    }

    users = payload.users;
    channels = payload.channels;
});

//Handling unexpected RTM closure (exit process so pm2 can restart)

controller.on('rtm_close', (bot, err) => {
    console.log('RTM Closed: ', err);
    process.exit(1);
});

//Bot joining channel event

controller.on('bot_channel_join', (bot, message) => {
    const userKey = message.inviter;

    const context = {
        controller: controller,
        users     : users
    };

    context[userKey] = {
        stakeholders: {
            id          : message.channel,
            techLeads   : [],
            productLeads: []
        }
    };

    context[userKey].senderInfo = users.filter((user) => {
        return user.id === message.inviter;
    })[0];

    context[userKey].invokerName = context[userKey].senderInfo.profile.first_name || context[userKey].senderInfo.name;

    bot.reply(message, `Hey there, ${context[userKey].invokerName}! I\'m Outto. Hopefully, I can make outages a little less hectic when they occur. I\'ll send you a DM so we can determine your tech and product stakeholders that I\'ll inform if an outage report is created in this channel. Call \`!outagebot-help\` if you need any assistance.`);

    bot.startPrivateConversation({
        user: message.inviter
    }, helpers.init.bind(context));
});

//Initialize outagebot stakeholders:

controller.hears([/^!outagebot-init$/], ['ambient'], (bot, message) => {
    const userKey = message.user;

    const context = {
        controller: controller,
        users     : users
    };

    context[userKey] = {
        stakeholders: {
            id          : message.channel,
            techLeads   : [],
            productLeads: []
        }
    };

    context[userKey].senderInfo = users.filter((user) => {
        return user.id === message.user;
    })[0];

    context[userKey].invokerName = context[userKey].senderInfo.profile.first_name || context[userKey].senderInfo.name;

    bot.reply(message, `Hey there, ${context[userKey].invokerName}! I\'ll send you a DM so we can determine your tech and product stakeholders that I\'ll inform if an outage report is created in this channel.`);

    bot.startPrivateConversation({
        user: message.user
    }, helpers.init.bind(context));
});

//List stakeholders

controller.hears([/^!outagebot-list$/], ['ambient'], (bot, message) => {
    const context = {
        outageBot         : bot,
        controller        : controller,
        callingChannelId  : message.channel,
        callingChannelInfo: null,
        senderInfo        : null,
        invokerName       : null,
        techLeads         : '',
        productLeads      : ''
    };

    context.senderInfo = users.filter((user) => {
        return user.id === message.user;
    })[0];

    context.callingChannelInfo = channels.filter((channel) => {
        return context.callingChannelId === channel.id;
    })[0];

    context.invokerName = context.senderInfo.profile.first_name || context.senderInfo.name;

    helpers.listStakeholders.call(context);
});


//Quick outage report:

controller.hears([/^!outage$/], ['ambient'], (bot, message) => {
    const userKey = message.user;

    const context = {
        outageBot : bot,
        controller: controller,
        users     : users
    };

    context[userKey] = {
        quickReportResponses: {}
    };

    context[userKey].senderInfo = users.filter((user) => {
        return user.id === message.user;
    })[0];

    context[userKey].invokerName = context[userKey].senderInfo.profile.first_name || context[userKey].senderInfo.name;

    context[userKey].callingChannel = message.channel;

    bot.reply(message, `Sorry to hear about that outage, ${context[userKey].invokerName}. I\'ll send a DM and ask you three quick questions.`);

    bot.startPrivateConversation({
        user: message.user
    }, helpers.quickReport.bind(context));
});

//Full-length outage report:

controller.hears([/^!report$/], ['ambient'], (bot, message) => {
    const userKey = message.user;

    const context = {
        outageBot     : bot,
        controller    : controller,
        users         : users,
        callingChannel: message.channel,
        helpers       : helpers
    };

    context[userKey] = {
        fullReportInputs: {}
    };

    context[userKey].callingChannel = message.channel;
    context[userKey].senderInfo = users.filter((user) => {
        return user.id === message.user;
    })[0];

    context[userKey].invokerName = context[userKey].senderInfo.profile.first_name || context[userKey].senderInfo.name;

    bot.reply(message, `Alright ${context[userKey].invokerName}. I\'ll send you a DM to get the details.`);

    bot.startPrivateConversation({
        user: message.user
    }, helpers.fullOutageReport.bind(context));
});

//List commands with help

controller.hears([/^!outagebot-help$/], ['ambient'], (bot, message) => {
    const context = {
        users      : users,
        senderInfo : null,
        invokerName: null
    };

    context.senderInfo = users.filter((user) => {
        return user.id === message.user;
    })[0];

    context.invokerName = context.senderInfo.profile.first_name || context.senderInfo.name;

    bot.reply(message, `Hey, ${context.invokerName}! Here are some commands you can use to interact with me: 
        •  \`!outage\` - Create a quick outage report that will alert your stakeholders
        •  \`!report\` - Create a full outage report that will be uploaded to Google Drive
        •  \`!outagebot-init\` - Configure the tech and product stakeholders for this channel
        •  \`!outagebot-list\` - List the currently configured stakeholders for this channel
        •  \`!outagebot-help\` - See all available outagebot commands`);
});