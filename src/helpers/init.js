'use strict';

function askForTechLeads(response, convo) {
    const self = this,
        userKey = convo.context.user;

    convo.ask('Please respond with a space-separated list of the Slack usernames (e.g. @janedoe @johndoe) for the *tech* leads who should be informed when there is an outage, or say "none".', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Got it.');

            const techLeadsInput = (response.text.trim().replace(/\@|\<|\>/g, '')).split(' ');

            techLeadsInput.forEach((lead) => {
                self.users.forEach((user) =>  {
                    if (user.id === lead) {
                        self[userKey].stakeholders.techLeads.push({
                            id       : user.id,
                            team_id  : user.team_id,
                            name     : user.name,
                            deleted  : user.deleted,
                            real_name: user.real_name,
                            is_bot   : user.is_bot,
                            presence : user.presence
                        });
                    }
                });
            });

            askForProductLeads.call(self, response, convo);

            convo.next();
        }
    });
}

function askForProductLeads(response, convo) {
    const self = this,
        userKey = convo.context.user;


    convo.ask('Please respond with a space-separated list of the Slack usernames (e.g. @janedoe @johndoe) for the *product* leads who should be informed when there is an outage, or say "none".', (response, convo) => {
        if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
            convo.say('Alright. Invoke me again if you need me.');
            delete self[userKey];
            convo.next();
        } else {
            convo.say('Cool.');

            const productLeadsInput = (response.text.trim().replace(/\@|\<|\>/g, '')).split(' ');

            productLeadsInput.forEach((lead) =>  {
                self.users.forEach((user) => {
                    if (user.id === lead) {
                        self[userKey].stakeholders.productLeads.push({
                            id       : user.id,
                            team_id  : user.team_id,
                            name     : user.name,
                            deleted  : user.deleted,
                            real_name: user.real_name,
                            is_bot   : user.is_bot,
                            presence : user.presence
                        });
                    }
                });
            });

            printLeadsListAndConfirm.call(self, response, convo);

            convo.next();
        }
    });
}

function buildLeadBulletPoints(leadsArray) {
    let leadBullets = '';

    if (leadsArray.length === 0) {
        return '• None assigned';
    }

    leadsArray.forEach((lead, index) => {
        console.log(lead);
        if (index === 0) {
            leadBullets += `• ${lead.real_name} - ${lead.name}`;
        } else {
            leadBullets += `\n• ${lead.real_name} - ${lead.name}`;
        }
    });

    return leadBullets;
}

function buildStakeholdersAttachment(stakeholders) {
    const attachments = [];
    const attachment = {
        color : '#0000ff',
        fields: []
    };

    attachment.fields.push({
        title: 'Tech Leads:',
        value: buildLeadBulletPoints(stakeholders.techLeads),
        short: false
    });

    attachment.fields.push({
        title: 'Product Leads:',
        value: buildLeadBulletPoints(stakeholders.productLeads),
        short: false
    });

    attachments.push(attachment);

    return attachments;
}

function printLeadsListAndConfirm(response, convo) {
    const self = this,
        userKey = convo.context.user,
        leadsList = buildStakeholdersAttachment(self[userKey].stakeholders);

    if (response.text === 'stop' || response.text === 'nevermind' || response.text === 'exit') {
        convo.say('Alright. Invoke me again if you need me.');
        delete self[userKey];
        convo.next();
    } else {
        convo.say({
            text       : '',
            attachments: leadsList
        }, (err) => {
            if (err) {
                console.log('Print leads list error: ', err);
            }
        });

        convo.ask('Are these all the stakeholders that should be informed during an outage? (y/n)', (response, convo) => {
            if (response.text !== 'y' && response.text !== 'yes') {
                self[userKey].stakeholders.techLeads = [];
                self[userKey].stakeholders.productLeads = [];

                askForTechLeads.call(self, response, convo);
            } else {
                console.log('self[userKey].stakeholders: ', self[userKey].stakeholders);
                self.controller.storage.channels.save(self[userKey].stakeholders, (err) => {
                    if (err) {
                        console.log('Failure to save stakeholders in Dynamo: ', err);
                    }
                });
                convo.say('Your configuration has been saved. If you ever want to change it, call outagebot-init again.');
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

module.exports = askForTechLeads;