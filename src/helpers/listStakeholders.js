'use strict';

function buildAttachment() {
    const self = this;

    const attachments = [];
    const attachment = {
        color : '#0000FF',
        fields: []
    };

    attachment.fields.push({
        title: 'Tech Leads:',
        value: self.techLeads,
        short: false
    });

    attachment.fields.push({
        title: 'Product Leads:',
        value: self.productLeads,
        short: false
    });

    attachments.push(attachment);

    return attachments;
}

function listStakeholders() {
    const self = this;

    self.controller.storage.channels.get(self.callingChannelId, (err, data) => {
        if (err || (data && data.techLeads.length === 0 && data.productLeads.length === 0)) {
            self.outageBot.say({
                text   : `No configuration found for the ${self.callingChannelInfo.name} channel. Call \`!outagebot-init\` to configure the leads who will be contacted in the event of an outage.`,
                channel: self.callingChannelId
            });
        } else {
            if (data.techLeads.length === 0) {
                self.techLeads = '• None specified';
            } else {
                data.techLeads.forEach((lead, index) => {
                    if (index === 0) {
                        self.techLeads += `• ${lead.real_name} - ${lead.name}`;
                    } else {
                        self.techLeads += `\n• ${lead.real_name} - ${lead.name}`;
                    }
                });
            }

            if (data.productLeads.length === 0) {
                self.productLeads = '• None specified';
            } else {
                data.productLeads.forEach((lead, index) => {
                    if (index === 0) {
                        self.productLeads += `• ${lead.real_name} - ${lead.name}`;
                    } else {
                        self.productLeads += `\n• ${lead.real_name} - ${lead.name}`;
                    }
                });
            }

            const stakeholderAttachment = buildAttachment.call(self);

            self.outageBot.say({
                text       : `These are the configured leads for the ${self.callingChannelInfo.name} channel:`,
                attachments: stakeholderAttachment,
                channel    : self.callingChannelId
            });
        }
    });
}

module.exports = listStakeholders;
