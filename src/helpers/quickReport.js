'use strict';

function askWhatIsImpacted(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('Please list the services or queues known to be affected. (type "exit" at any time to cancel)', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Gotchya.');
            self[userKey].quickReportResponses.impactedSystems = response.text;

            askNatureOfOutage.call(self, response, convo);

            convo.next();
        }
    });
}

function askNatureOfOutage(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('Is data failing to enter our system or being delayed?', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Okay.');
            self[userKey].quickReportResponses.typeOfIssue = response.text;

            askIfUserFacing.call(self, response, convo);

            convo.next();
        }
    });
}

function askIfUserFacing(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('Is the issue user-facing? If it is, what subset of users are affected and how?', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('I\'ll put together a report.');
            self[userKey].quickReportResponses.userFacing = response.text;

            printReportAndConfirm.call(self, response, convo);

            convo.next();
        }
    });
}

function buildAttachment() {
    const self = this;

    const attachments = [];
    const attachment = {
        color : '#FF3030',
        fields: []
    };

    attachment.fields.push({
        title: 'Systems affected:',
        value: `• ${self.quickReportResponses.impactedSystems}`,
        short: false
    });

    attachment.fields.push({
        title: 'Type of issue (e.g delay, failure):',
        value: `• ${self.quickReportResponses.typeOfIssue}`,
        short: false
    });

    attachment.fields.push({
        title: 'User-facing:',
        value: `• ${self.quickReportResponses.userFacing}`,
        short: false
    });

    attachments.push(attachment);

    return attachments;
}

function sendQuickReportToStakeholders(quickReport, userContext) {
    const self = this;
    let stakeholders;

    //Might have to change calling channel to use convo.context.channel
    self.controller.storage.channels.get(userContext.callingChannel, (err, data) => {
        if (err) {
            console.log('Failed to retrieve stakeholders from Dynamo: ', err);
        } else {
            stakeholders = data.techLeads.concat(data.productLeads);

            stakeholders.forEach((stakeholder) => {
                self.outageBot.say({
                    text       : `${userContext.invokerName} Created an Outage Quick Report:`,
                    attachments: quickReport,
                    channel    : stakeholder.id
                });
            });
        }
    });

    self.outageBot.say({
        link_names : 1,
        text       : `@channel ${userContext.invokerName} Created an Outage Quick Report:`,
        attachments: quickReport,
        channel    : userContext.callingChannel
    });
}

function printReportAndConfirm(response, convo) {
    const self = this,
        userKey = convo.context.user,
        quickReport = buildAttachment.call(self[userKey]);

    if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
        convo.say('Alright. Invoke me again if you need me.');
        delete self[userKey];
        convo.next();
    } else {
        convo.say({
            text       : '',
            attachments: quickReport
        }, (err) => {
            if (err) {
                console.log('Error sending quick report: ', err);
            }
        });

        convo.ask('Does this quick report look good to you? (y/n)', (response, convo) => {
            if (response.text !== 'y' && response.text !== 'yes') {
                self[userKey].quickReportResponses = {
                    impactedSystems: null,
                    typeOfIssue    : null,
                    userFacing     : null
                };

                askWhatIsImpacted.call(self, response, convo);
            } else {
                sendQuickReportToStakeholders.call(self, quickReport, self[userKey]);
                delete self[userKey];
            }
            convo.next();
        });
    }

    convo.on('end', () => {
        if (convo.source_message.user === userKey) {
            delete self[userKey];
        }
    });
}

module.exports = askWhatIsImpacted;