'use strict';

const async = require('async');
const officegen = require('officegen');
const fs = require('fs');
const Promise = require('bluebird');

const generateFile = function(input) {
    return new Promise((resolve, reject) => {
        input.date = input.date || (new Date()).toString();

        const docx = officegen({
            type       : 'docx',
            orientation: 'portrait'
        });

        docx.on('error', (err) => {
            console.log('Document Generator Error: ', err);
        });

        let pObj;

        //Heading
        pObj = docx.createP({ align: 'center' });

        pObj.addText( input.title, { font_face: 'Arial', font_size: 20 });
        pObj.addLineBreak();
        pObj.addHorizontalLine();
        pObj.addText( input.date, { font_face: 'Arial', font_size: 11 });
        pObj.addLineBreak();

        //Actors
        pObj = docx.createP({ align: 'left' });

        pObj.addText( 'Actors', { font_face: 'Arial', font_size: 16 });
        input.actors.forEach((actor) => {
            const pObj = docx.createListOfDots();
            pObj.addText( actor.trim(), { font_face: 'Arial', font_size: 11 });
        });
        pObj.addLineBreak();

        //Symptoms
        pObj = docx.createP({ align: 'left' });

        pObj.addText( 'Symptoms', { font_face: 'Arial', font_size: 16 });
        pObj.addLineBreak();
        pObj.addText( input.symptoms, { font_face: 'Arial', font_size: 11 });
        pObj.addLineBreak();

        //TLDR
        pObj = docx.createP({ align: 'left' });

        pObj.addText( 'TLDR', { font_face: 'Arial', font_size: 16 });
        pObj.addLineBreak();
        pObj.addText( input.tldr, { font_face: 'Arial', font_size: 11 });
        pObj.addLineBreak();

        //Discovery
        pObj = docx.createP({ align: 'left' });

        pObj.addText( 'Discovery', { font_face: 'Arial', font_size: 16 });
        pObj.addLineBreak();
        pObj.addText( input.discovery, { font_face: 'Arial', font_size: 11 });
        pObj.addLineBreak();

        //Steps Taken To Resolve
        pObj = docx.createP({ align: 'left' });

        pObj.addText( 'Steps Taken To Resolve', { font_face: 'Arial', font_size: 16 });
        pObj.addLineBreak();
        pObj.addText( input.resolution, { font_face: 'Arial', font_size: 11 });
        pObj.addLineBreak();

        const splitConversations = input.conversation.split('\n');

        //Full Conversation
        pObj = docx.createP({ align: 'left' });

        pObj.addText( 'Full Conversation', { font_face: 'Arial', font_size: 16 });
        pObj.addLineBreak();
        splitConversations.forEach((convoSnippet) => {
            pObj.addText( convoSnippet, { font_face: 'Arial', font_size: 11 });
            pObj.addLineBreak();
        });

        //Action Items
        pObj = docx.createP({ align: 'left' });

        pObj.addText( 'Action Items', { font_face: 'Arial', font_size: 16 });
        input.actionItems.forEach((actionItem) => {
            const pObj = docx.createListOfDots();
            pObj.addText( actionItem.trim(), { font_face: 'Arial', font_size: 11 });
        });
        pObj.addLineBreak();

        const out = fs.createWriteStream('tmp/output.docx');

        out.on('error', (err) => {
            console.log('generateFile error: ', err);
        });

        async.parallel([
            (done) => {
                out.on('close', () => {
                    resolve();
                    done(null);
                });
                docx.generate(out);
            }
        ], (err) => {
            if (err) {
                console.log('Error: ', err );
                reject(err);
            }
        });
    });
};

module.exports = generateFile;