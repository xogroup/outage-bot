# outage-bot
A slackbot to quickly inform your team and stakeholders to an outage in your system.

## How to use

To use outagebot, simply invite `outagebot` to your squad's slack channel.

Outagebot will then send you a direct message to get information about your squad's product and tech stakeholders.  These stakeholders will be alerted whenever an outage or outage report are filed.

## Commands

`!outagebot-help`

Outagebot will list out all commands available.

`!outagebot-list`

Outagebot will list the currently configured stakeholders for the channel.

`!outagebot-init`

Reinitializes your stored product and tech stakeholders (by slack username).

`!outage`

Outagebot will send you a direct message to get basic information about your outage to generate a short report to send to your entire squad (via your squad's slack channel), the tech stakeholder, and the product stakeholder.

`!report`

Outagebot will send you a direct message to get more detailed information about your outage to generate a comprehensive outage report.  Once completed, this report will be sent to your squad, tech/product stakeholders, and will be formatted and uploaded into the "outages" folder in Google Drive.
