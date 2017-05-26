'use strict';

function getTitle(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('What should the title of this report be? (type "exit" at any time to cancel)', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Okay.');
            getDate.call(self, response, convo);
            self[userKey].fullReportInputs.title = response.text;

            convo.next();
        }
    });
};

function getDate(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('What was the date of the outage?', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Alright.');
            getActors.call(self, response, convo);
            self[userKey].fullReportInputs.date = response.text;

            convo.next();
        }
    });
};

function getActors(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('Who were the actors involved? (separate names with a comma)', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Cool.');
            const actors = response.text.split(',');
            getSymptoms.call(self, response, convo);
            self[userKey].fullReportInputs.actors = actors;

            let bulletString = '';

            actors.forEach((actor, index) => {
                if (index === 0) {
                    bulletString += `• ${actor.trim()}`;
                } else {
                    bulletString += `\n• ${actor.trim()}`;
                }
            });

            self[userKey].fullReportInputs.actorsString = bulletString;

            convo.next();
        }
    });
};

function getSymptoms(response, convo) {
    const self = this,
        userKey = convo.context.user;


    convo.ask('What were the symptoms of the outage?', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Okay.');
            getTldr.call(self, response, convo);
            self[userKey].fullReportInputs.symptoms = response.text;

            convo.next();
        }
    });
};

function getTldr(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('What is the TLDR (too long - didn\'t read) summary of the outage?', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Awesome.');
            getDiscovery.call(self, response, convo);
            self[userKey].fullReportInputs.tldr = response.text;

            convo.next();
        }
    });
};

function getDiscovery(response, convo) {
    const self = this,
        userKey = convo.context.user;


    convo.ask('What was the discovery process for the outage?', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Alright, we\'re almost done.');
            getResolution.call(self, response, convo);
            self[userKey].fullReportInputs.discovery = response.text;

            convo.next();
        }
    });
};

function getResolution(response, convo) {
    const self = this,
        userKey = convo.context.user;


    convo.ask('What was the resolution for the outage?', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Okay.');
            getConversation.call(self, response, convo);
            self[userKey].fullReportInputs.resolution = response.text;

            convo.next();
        }
    });
}

function getConversation(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('Paste any relevant conversations, if applicable.', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Cool.');
            getActionItems.call(self, response, convo);
            self[userKey].fullReportInputs.conversation = response.text;

            convo.next();
        }
    });
}

function getActionItems(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('List any actions items resulting from this outage (separate items with a comma).', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            const actionItems = response.text.split(',');
            self[userKey].fullReportInputs.actionItems = actionItems;

            let bulletString = '';

            actionItems.forEach((item, index) => {
                if (index === 0) {
                    bulletString += `• ${item.trim()}`;
                } else {
                    bulletString += `\n• ${item.trim()}`;
                }
            });

            self[userKey].fullReportInputs.actionItemsString = bulletString;

            convo.say('All done! Let me get the report together.');

            confirmOutageReport.call(self, response, convo);

            convo.next();
        }
    });
}

function buildOutageReportPreview() {
    const self = this,
        attachments = [],
        attachment = {
            color : '#FFA500',
            fields: []
        };

    attachment.fields.push({
        title: 'Title:',
        value: self.fullReportInputs.title,
        short: false
    });

    attachment.fields.push({
        title: 'Date:',
        value: self.fullReportInputs.date,
        short: false
    });

    attachment.fields.push({
        title: 'Actors:',
        value: self.fullReportInputs.actorsString,
        short: false
    });

    attachment.fields.push({
        title: 'Symptoms:',
        value: self.fullReportInputs.symptoms,
        short: false
    });

    attachment.fields.push({
        title: 'TLDR:',
        value: self.fullReportInputs.tldr,
        short: false
    });

    attachment.fields.push({
        title: 'Discovery:',
        value: self.fullReportInputs.discovery,
        short: false
    });

    attachment.fields.push({
        title: 'Resolution:',
        value: self.fullReportInputs.resolution,
        short: false
    });

    attachment.fields.push({
        title: 'Conversation:',
        value: self.fullReportInputs.conversation,
        short: false
    });

    attachment.fields.push({
        title: 'Action Items:',
        value: self.fullReportInputs.actionItemsString,
        short: false
    });

    attachments.push(attachment);

    return attachments;
}

function sendOutageReportToStakeholders(outageReport, url, userContext) {
    const self = this;
    let stakeholders;

    self.controller.storage.channels.get(userContext.callingChannel, (err, data) => {
        if (err)  {
            console.log('Error retrieving channel record from Dynamo: ', err);
        } else {
            stakeholders = data.techLeads.concat(data.productLeads);

            stakeholders.forEach((stakeholder) => {
                self.outageBot.say({
                    text       : `${userContext.invokerName} Created an \<${url}\|Outage Report>:`,
                    attachments: outageReport,
                    channel    : stakeholder.id
                });
            });
        }
    });

    self.outageBot.say({
        link_names : 1,
        text       : `@channel ${userContext.invokerName} Created an \<${url}\|Outage Report>:`,
        attachments: outageReport,
        channel    : userContext.callingChannel
    });
}


function confirmOutageReport(response, convo) {
    const self = this,
        userKey = convo.context.user,
        outageReport = buildOutageReportPreview.call(self[userKey]);

    if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
        convo.say('Alright. Invoke me again if you need me.');
        delete self[userKey];
        convo.next();
    } else {
        convo.say({
            text       : '',
            attachments: outageReport
        }, (err) => {
            if (err) {
                console.log(err);
            }
        });

        convo.ask('Does this report look good to you? If you say no, we\'ll start again from scratch. (y/n)', (response, convo) => {
            if (response.text !== 'y' && response.text !== 'yes') {
                self[userKey].fullReportInputs =  {
                    title            : null,
                    date             : null,
                    actors           : null,
                    actorsString     : null,
                    symptoms         : null,
                    tldr             : null,
                    discovery        : null,
                    resolution       : null,
                    conversation     : null,
                    actionItems      : null,
                    actionItemsString: null
                };

                getTitle.call(self, response, convo);
            } else {
                return self.helpers.generateFile(self[userKey].fullReportInputs)
                    .then(() => {
                        return self.helpers.uploadFile(self[userKey].fullReportInputs.date, self[userKey].fullReportInputs.title);
                    })
                    .then((url) => {
                        return sendOutageReportToStakeholders.call(self, outageReport, url, self[userKey]);
                    })
                    .then(() => {
                        delete self[userKey];
                        convo.next();
                    })
                    .catch((err) => {
                        console.log(err);
                        convo.next();
                    });
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

module.exports = getTitle;