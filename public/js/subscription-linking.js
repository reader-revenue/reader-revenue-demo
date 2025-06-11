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

/* Glocal Constants */
const PUB_ID_1 = 'process.env.PUBLICATION_ID';
const PUB_ID_2 = 'process.env.PUBLICATION_ID_SL_BUNDLE';
/* Glocal variables. The ppids change based on the user input */
let ppid1 = randomPpid();
let ppid2 = randomPpid();

/**
 * linkSubscription
 * Initiates a linked subscription
 * @param {number} ppid
 * @param {object} eventHandler
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
 * @param {{publicationId: string, ppid: string}[]} slDataArr 
 *  An array containing data for the subscriptions to be linked.
 *  It is expected to contain exactly two element in the array
 * @param {object} eventHandler
*/
function linkSubscriptions(slDataArr, eventHandler) {
  self.SWG.push(async (subscriptions) => {
      try {
        const result = await subscriptions.linkSubscriptions({linkTo: [
            { publicationId: slDataArr[0].publicationId, publisherProvidedId: slDataArr[0].ppid },
            { publicationId: slDataArr[1].publicationId, publisherProvidedId: slDataArr[1].ppid }
        ]});
        console.log('Subscription Linking bundle result - ', result);
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
  const button = createButton({
    'buttonText': 'Initiate Link',
    'callback' : (event)=>{
      event.preventDefault();
      linkSubscription(ppid, eventHandler)
    }
  });
  const inputPubId = createInput({'initialValue': PUB_ID_1, 'id': 'single-sl-pubid-input', 'disable':true});
  const ppidInput = createInput({'initialValue': ppid, 'id': 'ppid-input', 
    'callback': (newValue)=> {
      ppid = newValue;
      button.disabled = !!ppid ? false : true;
    }
  });
  const headerRow = createHeaderRow(['PublicationID', 'PPID']);
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
  const button = createButton({
    'buttonText': 'Bundle Multiple Subscription Linking',
    'callback' : (event)=>{
      event.preventDefault();
      const slDataArr = [
        {'publicationId':PUB_ID_1, 'ppid': ppid1},
        {'publicationId':PUB_ID_2, 'ppid': ppid2},
      ];
      linkSubscriptions(slDataArr, eventHandler);
    }
  });
  // Publication ID input. The default value is env.PUBLICATION_ID
  const inputPubId1 = createInput({'initialValue': PUB_ID_1, 'id':'bundle-pubid-input-1','disable': true});
  const inputPubId2 = createInput({'initialValue': PUB_ID_2, 'id':'bundle-pubid-input-2','disable': true});
  // PPID ID input. The default value is ppid1, which has been randomly created by randomPpid()
  const inputPPID1 = createInput({'initialValue': ppid1, 'id':'bundle-ppid-input-1',
    'callback': (newValue)=> {
      ppid1 = newValue;
      button.disabled = !!ppid1 ? false : true;
    }
  });
  const inputPPID2 = createInput({'initialValue': ppid2, 'id':'bundle-ppid-input-2',
    'callback': (newValue)=> {
      ppid2 = newValue;
      button.disabled = newValue ? false : true;
    }
  });
  // Create containers for each row
  const row1 = createRow('input-row', [inputPubId1, inputPPID1]);
  const row2 = createRow('input-row', [inputPubId2, inputPPID2]);
  // Create the header row
  const headerRow = createHeaderRow(['PublicationID', 'PPID']);
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
  const output = document.createElement('pre');
  const queryEntitlementsButton = createButton({
    'buttonText': 'Query Entitlements for PPID',
    'callback' :     async (event)=>{
      event.preventDefault();
      const code = document.createElement('code');
      code.classList.add('hljs', 'language-json');  
      const loader = new Loader(output);
      loader.start();
      const entitlements = await queryEntitlementsForPpid(ppid, PUB_ID_1);
      const textString = JSON.stringify(entitlements, null, 2);
      const formattedTextString = hljs.highlight(textString, {language: 'json'})
      const textNodeFromString = document
          .createRange()
          .createContextualFragment(formattedTextString.value)
      code.append(textNodeFromString)
      loader.stop();
      output.append(code);
    }
  });
  // Publication ID input. The default value is env.PUBLICATION_ID
  const pubIdInput = createInput({'initialValue': PUB_ID_1, 'id':'pubid-query', 'disable': true});
  // PPID ID input. The default value is ppid1, which has been randomly created by randomPpid()
  const ppidInput = createInput({'initialValue': ppid1, 'id':'ppid-query',
    'callback': (newValue)=> {
      ppid = newValue;
      queryEntitlementsButton.disabled = newValue ? false : true;
    }
  });
  // Set these tow inputs into a row
  const inputRow = createRow('input-row', [pubIdInput,ppidInput]);
  // header row to make it clear these input elements are for publicationId and PPID
  const headerRow = createHeaderRow(['PublicationID', 'PPID']);
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
  const output = document.createElement('pre');
  const updateEntitlementsButton = createButton({'buttonText': 'Update Entitlements for PPID', 
    'callback': async (event) => {
      event.preventDefault();
      const code = document.createElement('code');
      code.classList.add('hljs', 'language-json');
      const loader = new Loader(output);
      loader.start();
      const entitlements = await updateEntitlementsForPpid(ppid, PUB_ID_1);
      const textString = JSON.stringify(entitlements, null, 2);
      const formattedTextString = hljs.highlight(textString, {language: 'json'})
      const textNodeFromString = document.createRange().createContextualFragment(
          formattedTextString.value)
      code.append(textNodeFromString)
      loader.stop();
      output.append(code)
    }
  });
  // Publication ID input. The default value is env.PUBLICATION_ID
  const pubIdInput = createInput({'initialValue': PUB_ID_1, id: 'pubid-query', 'disable': true});
  // PPID ID input. The default value is ppid1, which has been randomly created by randomPpid()
  const ppidInput = createInput({'initialValue': ppid1, 'id': 'ppid-query', 
    'callback' :(newValue) => {
      ppid = newValue;
      updateEntitlementsButton.disabled = newValue ? false : true;
    }
  });
  // Set these tow inputs into a row
  const row = createRow('input-row', [pubIdInput, ppidInput]);
  // header row to make it clear these input elements are for publicationId and PPID
  const headerRow = createHeaderRow(['PublicationID', 'PPID']);
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

/**
 * Create and render forms on DOMContentLoaded
 */
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
