/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/es/highlight.min.js';

import {Loader, createInput, createButton, createForm, createRow, createHeaderRow} from './utils.js';
import { AnalyticsEventHandler } from './subscription-linking-event-handler.js';

let ppid1 = randomPpid();
let ppid2 = randomPpid();
let pubId1 = 'process.env.PUBLICATION_ID';
let pubId2 = 'process.env.PUBLICATION_ID_SL_BUNDLE';

/**
 * linkSubscription
 * Initiates a linked subscription
 * @param {number} {ppid}
 */
function linkSubscription(ppid, eventHandler) {
  self.SWG.push(async (subscriptions) => {
      try {
        const result = await subscriptions.linkSubscription({
          publisherProvidedId: ppid.trim(),
        });
        eventHandler.logCallback(result);
      } catch(e) {
        console.log(e);
      }
  });
}

/**
 * linkSubscriptions: link multiple publications
 * @param {array} 
 */
function linkSubscriptions(slDataArr, eventHandler) {
  console.log('linkSubscriptions ', slDataArr);
  self.SWG.push(async (subscriptions) => {
      try {
        const result = await subscriptions.linkSubscriptions({linkTo: [
            { publicationId: slDataArr[0].publicationId, publisherProvidedId: slDataArr[0].ppid },
            { publicationId: slDataArr[1].publicationId, publisherProvidedId: slDataArr[1].ppid }
        ]});
        console.log('bundle result - ', result);
        eventHandler.logCallback(result);
      } catch(e) {
        console.log(e);
      }
  });
}

/**
 * randomPpid()
 * Generates a random ppid
 * @returns {string}
 */
function randomPpid() {
  return String(Math.floor(Math.random() * 1e6));
}

/**
 * createSingleSLForm()
 * Creates a form, and appends it to the DOM after #initiateLink
 */
function createSingleSLForm(eventHandler) {
  let ppid = ppid1;
  const button = createButton('Initiate Link', '', '', true, (event)=>{
    event.preventDefault();
    linkSubscription(ppid, eventHandler);
  });
  const inputPubId = createInput(pubId1, 'single-sl-pubid-input', '', '', false);
  const ppidInput = createInput(ppid, 'ppid-input', '', '', true, (newValue)=> {
    ppid = newValue;
    button.disabled = newValue ? false : true;
  });
  const headerRow = createHeaderRow('PublicationID', 'PPID');
  const row = createRow('input-row', [inputPubId, ppidInput]);
  const form = createForm([headerRow, row, button]);
  document.querySelector('#initiateLink').insertAdjacentElement('afterend', form);
}

/**
 * createBundleSLForm()
 * Creates a form, and appends it to the DOM after #initiateLink
 */
function createBundleSLForm(eventHandler) {
  // button to start the linking
  const button = createButton('Bundle Multiple Subscription Linking', '', '', true, (event)=>{
    event.preventDefault();
    const slDataArr = [
      {'publicationId':pubId1, 'ppid': ppid1},
      {'publicationId':pubId2, 'ppid': ppid2},
    ];
    linkSubscriptions(slDataArr, eventHandler);
  });
  // Publication ID input. The default value is env.PUBLICATION_ID
  const inputPubId1 = createInput(pubId1, 'bundle-pubid-input-1', '', '', false);
  const inputPubId2 = createInput(pubId2, 'bundle-pubid-input-2', '', '', false);
  // PPID ID input. The default value is ppid1, which has been randomly created by randomPpid()
  const inputPPID1 = createInput(ppid1, 'bundle-ppid-input-1', '', '', true, (newValue)=> {
    ppid1 = newValue;
    button.disabled = newValue ? false : true;
  });
  const inputPPID2 = createInput(ppid2, 'bundle-ppid-input-2', '', '', true, (newValue)=> {
    ppid2 = newValue;
    button.disabled = newValue ? false : true;
  });
  // Create containers for each row
  const row1 = createRow('input-row', [inputPubId1, inputPPID1]);
  const row2 = createRow('input-row', [inputPubId2, inputPPID2]);
  // Create the header row
  const headerRow = createHeaderRow('PublicationID', 'PPID');
  const form = createForm([headerRow,row1,row2,button]);
  document.querySelector('#bundleLink').insertAdjacentElement('afterend', form);
}

/**
 * createQueryForm()
 * Creates a form, and appends it to the DOM after #initiateLink.
 * Used for querying entitlements from the api
 */
function createQueryEntitlementsForm() {
  let ppid = ppid1;
  let pubId = pubId1; // env.PUBLICATION_ID
  const output = document.createElement('pre');
  const queryEntitlementsButton = createButton('Query Entitlements for PPID', '', '', true,
    async (event)=>{
      event.preventDefault();
      const code = document.createElement('code');
      code.classList.add('hljs', 'language-json');  
      const loader = new Loader(output);
      loader.start();
      const entitlements = await queryEntitlementsForPpid(ppid, pubId);
      const textString = JSON.stringify(entitlements, null, 2);
      const formattedTextString = hljs.highlight(textString, {language: 'json'})
      const textNodeFromString = document
          .createRange()
          .createContextualFragment(formattedTextString.value)
      code.append(textNodeFromString)
      loader.stop();
      output.append(code)     
  });

  // Publication ID input. The default value is env.PUBLICATION_ID
  const pubIdInput = createInput(pubId1, 'pubid-query', '', '', false);
  // PPID ID input. The default value is ppid1, which has been randomly created by randomPpid()
  const ppidInput = createInput(ppid1, 'ppid-query', '', '', true, (newValue)=> {
    ppid = newValue;
    queryEntitlementsButton.disabled = newValue ? false : true;
  });
  // Set these tow inputs into a row
  const inputRow = createRow('input-row', [pubIdInput,ppidInput]);
  // header row to make it clear these input elements are for publicationId and PPID
  const headerRow = createHeaderRow('PublicationID', 'PPID');
  const form = createForm([headerRow, inputRow, queryEntitlementsButton, output]);
  document.querySelector('#queryPpid').insertAdjacentElement('afterend', form);
}

/**
 * createUpdateForm()
 * Creates a form, and appends it to the DOM after #initiateLink.
 * Used for querying entitlements from the api
 */
function createUpdateEntitlementsForm() {
  let ppid = ppid1;
  let pubId = pubId1; // env.PUBLICATION_ID
  const output = document.createElement('pre');
  const updateEntitlementsButton = createButton('Update Entitlements for PPID', '', '', true,
    async (event) => {
      event.preventDefault();
      const code = document.createElement('code');
      code.classList.add('hljs', 'language-json');
      const loader = new Loader(output);
      loader.start();
      const entitlements = await updateEntitlementsForPpid(ppid, pubId);
      const textString = JSON.stringify(entitlements, null, 2);
      const formattedTextString = hljs.highlight(textString, {language: 'json'})
      const textNodeFromString = document.createRange().createContextualFragment(
          formattedTextString.value)
      code.append(textNodeFromString)
      loader.stop();
      output.append(code)
  });
  // Publication ID input. The default value is env.PUBLICATION_ID
  const pubIdInput = createInput(pubId1, 'pubid-query', '', '', false);
  // PPID ID input. The default value is ppid1, which has been randomly created by randomPpid()
  const ppidInput = createInput(ppid1, 'ppid-query', '', '', true, (newValue) => {
    ppid = newValue;
    updateEntitlementsButton.disabled = newValue ? false : true;
  });
  // Set these tow inputs into a row
  const row = createRow('input-row', [pubIdInput, ppidInput]);
  // header row to make it clear these input elements are for publicationId and PPID
  const headerRow = createHeaderRow('PublicationID', 'PPID');
  const form = createForm([headerRow, row, updateEntitlementsButton, output]);
  document.querySelector('#updatePpid').insertAdjacentElement('afterend', form);
}

/**
 * queryEntitlementsForPpid(ppid)
 * @param {string} ppid The ppid of the subscriber.
 * @returns {{ppid: string}} The ppid.
 * Query entitlements for a given ppid
 */
async function queryEntitlementsForPpid(ppid, publicationId) {
  const host = location.host;
  const endpoint = `api/subscription-linking/readers/${publicationId}/${ppid}/entitlements`;
  const url = `https://${host}/${endpoint}`;
  try {
    return await fetch(url).then(r => r.json()).then(r => {return r.data});
  } catch (e) {
    throw new Error(`Unable to query entitlements at ${url}`);
  }
}

/**
 * UpdateEntitlementsForPpid(ppid)
 * @param {string} ppid The ppid of the subscriber.
 * @returns {{ppid: string}} The ppid.
 * Query entitlements for a given ppid
 */
async function updateEntitlementsForPpid(ppid, publicationId) {
  const host = location.host;
  const endpoint = `api/subscription-linking/readers/${publicationId}/${ppid}/entitlements`;
  const url = `https://${host}/${endpoint}`;
  const options = {method: 'PUT'};
  try {
    return await fetch(url, options).then(r => r.json()).then(r => {
      return r.update.data;
    });
  } catch (e) {
    throw new Error(`Unable to update entitlements at ${url}`);
  }
}

/**
 * analyticsEventLogger(subs)
 * @param {object} subs The subscription object from instantiating swg.js
 * Creates an eventManager that listens to events fired by swg.js.
 */
function analyticsEventLogger(subs, eventHandler) {
  subs.getEventManager().then(manager => {
      manager.registerEventListener((event) => {
        eventHandler.logEvent(event);
        //intent.determination can be one of the following:
        //['success','failure','declined'] or undefined
        const intent = eventHandler.determineIntent();
        if(intent.determination !== undefined) {
          console.debug(intent.message);
        }
      })
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const eventHandler = new AnalyticsEventHandler();
  createSingleSLForm(eventHandler);
  createBundleSLForm(eventHandler);
  createQueryEntitlementsForm();
  createUpdateEntitlementsForm();
  (self.SWG = self.SWG || []).push(subscriptions => {
    subscriptions.init('process.env.PUBLICATION_ID');
    analyticsEventLogger(subscriptions, eventHandler);
  });
});
