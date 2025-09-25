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

/* Global variable */
const subscriptionLinkingData = {
  single: {
    publicationId: 'process.env.PUBLICATION_ID',
    ppid: randomPpid()
  },
  bundle: {
    pub1: {
      publicationId: 'process.env.PUBLICATION_ID',
      ppid: randomPpid()
    },
    pub2: {
      publicationId: 'process.env.PUBLICATION_ID_SL_BUNDLE',
      ppid: randomPpid()
    }
  }
};

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
    const linkToPayload = slDataArr.map(sub => ({
      publicationId: sub.publicationId.trim(),
      publisherProvidedId: sub.ppid.trim()
    }));      
    try {
      const result = await subscriptions.linkSubscriptions({
        linkTo: linkToPayload
      });
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
function createSingleSLForm(singleLinkData, eventHandler) {
  const button = createButton({
    'buttonText': 'Initiate Link',
    'callback' : (event)=>{
      event.preventDefault();
      linkSubscription(singleLinkData.ppid, eventHandler)
    }
  });
  const inputPubId = createInput({'initialValue': singleLinkData.publicationId, 'id': 'single-sl-pubid-input',
    'callback': (newValue)=> {
      singleLinkData.publicationId = newValue;
      button.disabled = !!singleLinkData.publicationId ? false : true;
    }
  });
  const ppidInput = createInput({'initialValue': singleLinkData.ppid, 'id': 'ppid-input', 
    'callback': (newValue)=> {
      singleLinkData.ppid = newValue;
      button.disabled = !!singleLinkData.ppid ? false : true;
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
function createBundleSLForm(bundleLinkData, eventHandler) {
  // button to start the linking
  const button = createButton({
    'buttonText': 'Bundle Multiple Subscription Linking',
    'callback' : (event)=>{
      event.preventDefault();
      const slDataArr = [
        {'publicationId':bundleLinkData.pub1.publicationId, 'ppid': bundleLinkData.pub1.ppid},
        {'publicationId':bundleLinkData.pub2.publicationId, 'ppid': bundleLinkData.pub2.ppid},
      ];
      linkSubscriptions(slDataArr, eventHandler);
    }
  });
  // Publication ID input. The default value is env.PUBLICATION_ID
  const inputPubId1 = createInput({'initialValue': bundleLinkData.pub1.publicationId, 'id':'bundle-pubid-input-1', 
    'callback': (newValue)=> {
      bundleLinkData.pub1.publicationId = newValue;
      button.disabled = !!bundleLinkData.pub1.publicationId ? false : true;
    }
  });
  const inputPubId2 = createInput({'initialValue': bundleLinkData.pub2.publicationId, 'id':'bundle-pubid-input-2',
    'callback': (newValue)=> {  
      bundleLinkData.pub2.publicationId = newValue;
      button.disabled = !!bundleLinkData.pub2.publicationId ? false : true;
    }
  });
  // PPID ID input. The default value is created by randomPpid()
  const inputPPID1 = createInput({'initialValue': bundleLinkData.pub1.ppid, 'id':'bundle-ppid-input-1',
    'callback': (newValue)=> {
      bundleLinkData.pub1.ppid = newValue;
      button.disabled = !!bundleLinkData.pub1.ppid ? false : true;
    }
  });
  const inputPPID2 = createInput({'initialValue': bundleLinkData.pub2.ppid, 'id':'bundle-ppid-input-2',
    'callback': (newValue)=> {
      bundleLinkData.pub2.ppid = newValue;
      button.disabled = bundleLinkData.pub2.ppid ? false : true;
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
function createQueryEntitlementsForm(singleLinkData) {
  const output = document.createElement('pre');
  const queryEntitlementsButton = createButton({
    'buttonText': 'Query Entitlements for PPID',
    'callback' :     async (event)=>{
      event.preventDefault();
      const code = document.createElement('code');
      code.classList.add('hljs', 'language-json');  
      const loader = new Loader(output);
      loader.start();
      const entitlements = await queryEntitlementsForPpid(singleLinkData.ppid, singleLinkData.publicationId);
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
  const pubIdInput = createInput({'initialValue': singleLinkData.publicationId, 'id':'pubid-query', 
    'callback': (newValue)=> {
      singleLinkData.publicationId = newValue;
      queryEntitlementsButton.disabled = !!singleLinkData.publicationId ? false : true;
    }
  }); 
  // PPID ID input. The default value is randomly created by randomPpid()
  const ppidInput = createInput({'initialValue': singleLinkData.ppid, 'id':'ppid-query',
    'callback': (newValue)=> {
      singleLinkData.ppid = newValue;
      queryEntitlementsButton.disabled = !!singleLinkData.ppid ? false : true;
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
function createUpdateEntitlementsForm(singleLinkData) {
  const output = document.createElement('pre');
  const updateEntitlementsButton = createButton({'buttonText': 'Update Entitlements for PPID', 
    'callback': async (event) => {
      event.preventDefault();
      const code = document.createElement('code');
      code.classList.add('hljs', 'language-json');
      const loader = new Loader(output);
      loader.start();
      const entitlements = await updateEntitlementsForPpid(singleLinkData.ppid, singleLinkData.publicationId);
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
  const pubIdInput = createInput({'initialValue': singleLinkData.publicationId, id: 'pubid-query',  
    'callback': (newValue)=> {
      singleLinkData.publicationId = newValue;
      queryEntitlementsButton.disabled = !!singleLinkData.publicationId ? false : true;
    }
  }); 
  // PPID ID input. The default value is randomly created by randomPpid()
  const ppidInput = createInput({'initialValue': singleLinkData.ppid, 'id': 'ppid-query',
    'callback' :(newValue) => {
      singleLinkData.ppid = newValue;
      updateEntitlementsButton.disabled = singleLinkData.ppid ? false : true;
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
 * createUnlinkForm()
 * Creates a form, and appends it to the DOM after #initiateLink.
 * Used for unlinking a given ppid from a publication
 */
function createUnlinkForm(singleLinkData) {
  const { ppid, publicationId } = singleLinkData
  const output = document.createElement('pre');
  const unlinkButton = createButton({'buttonText': 'Unlink Subscription', 
    'callback': async (event) => {
      event.preventDefault();
      const code = document.createElement('code');
      code.classList.add('hljs', 'language-json');
      const loader = new Loader(output);
      loader.start();
      const response = await unlinkSubscription(ppid, publicationId);
      const textString = JSON.stringify(response, null, 2);
      const formattedTextString = hljs.highlight(textString, {language: 'json'})
      const textNodeFromString = document.createRange().createContextualFragment(
          formattedTextString.value)
      code.append(textNodeFromString)
      loader.stop();
      output.append(code)
    }
  });

  // Publication ID input. The default value is env.PUBLICATION_ID
  const pubIdInput = createInput({'initialValue': publicationId, id: 'pubid-query',  
    'callback': (newValue)=> {
      publicationId = newValue;
      queryEntitlementsButton.disabled = !!publicationId ? false : true;
    }
  }); 
  // PPID ID input. The default value is randomly created by randomPpid()
  const ppidInput = createInput({'initialValue': ppid, 'id': 'ppid-query',
    'callback' :(newValue) => {
      ppid = newValue;
      updateEntitlementsButton.disabled = ppid ? false : true;
    }
  });
  // Set these tow inputs into a row
  const row = createRow('input-row', [pubIdInput, ppidInput]);
  // header row to make it clear these input elements are for publicationId and PPID
  const headerRow = createHeaderRow(['PublicationID', 'PPID']);
  const form = createForm([headerRow, row, unlinkButton, output]);
  document.querySelector('#unlink').insertAdjacentElement('afterend', form);
}

/**
 * UpdateEntitlementsForPpid(ppid)
 * @param {string} ppid The ppid of the subscriber.
 * @returns {{ppid: string}} The ppid.
 * Query entitlements for a given ppid
 */
async function unlinkSubscription(ppid, publicationId) {
  const host = location.host;
  const endpoint = `api/subscription-linking/readers/${publicationId}/${ppid}`;
  const url = `https://${host}/${endpoint}`;
  const options = {method: 'DELETE'};
  try {
    return await fetch(url, options).then(r => r.json()).then(r => {
      return r.update.data;
    });
  } catch (e) {
    throw new Error(`Unable to unlink subscription at ${url}`);
  }
}

/**
 * analyticsEventLogger(subs)
 * @param {object} subscription The subscription object from instantiating swg.js
 * Creates an eventManager that listens to events fired by swg.js.
 */
function analyticsEventLogger(subscription, eventHandler) {
  subscription.getEventManager().then(manager => {
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
  createBundleSLForm(subscriptionLinkingData.bundle, eventHandler);
  createQueryEntitlementsForm(subscriptionLinkingData.single);
  createUpdateEntitlementsForm(subscriptionLinkingData.single);
  createUnlinkForm(subscriptionLinkingData.single);
  (self.SWG = self.SWG || []).push(subscriptions => {
    analyticsEventLogger(subscriptions, eventHandler);
    createSingleSLForm(subscriptionLinkingData.single, eventHandler);
  });
});
