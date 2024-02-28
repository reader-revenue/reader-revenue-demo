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

import {Loader} from './utils.js';
import { AnalyticsEventHandler } from './subscription-linking-event-handler.js';

/**
 * linkSubscription
 * Initiates a linked subscription
 * @param {number} ppid
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
 * randomPpid()
 * Generates a random ppid
 * @returns {string}
 */
function randomPpid() {
  return String(Math.floor(Math.random() * 1e6));
}


/**
 * createForm()
 * Creates a form, and appends it to the DOM after #initiateLink
 */
function createForm(eventHandler) {
  let ppid = randomPpid();

  const button = document.createElement('button');
  button.innerText = "Initiate Link";
  button.addEventListener('click', (event)=>{
    event.preventDefault();
    linkSubscription(ppid, eventHandler);
  });

  const input = document.createElement('input');
  input.setAttribute('value', ppid);
  input.setAttribute('id', 'ppid-input');
  input.onchange = (event)=>{
    ppid = event.target.value;
  };

  const form = document.createElement('form');
  form.appendChild(input);
  form.appendChild(button);

  document
      .querySelector('#initiateLink')
      .insertAdjacentElement('afterend', form);
}

/**
 * createQueryForm()
 * Creates a form, and appends it to the DOM after #initiateLink.
 * Used for querying entitlements from the api
 */
function createQueryForm() {

  let ppid = '';

  const output = document.createElement('pre');
  const code = document.createElement('code');
  code.classList.add('hljs', 'language-json');

  const button = document.createElement('button');
  button.innerText = "Query Entitlements for PPID";
  button.addEventListener('click', async (event)=>{
    event.preventDefault();
    const loader = new Loader(output);
    loader.start();
    const entitlements = await queryEntitlementsForPpid(ppid);
    const textString = JSON.stringify(entitlements, null, 2);
    const formattedTextString = hljs.highlight(textString, {language: 'json'})
    const textNodeFromString = document
        .createRange()
        .createContextualFragment(formattedTextString.value)
    code.append(textNodeFromString)
    loader.stop();
    output.append(code)
  });

  const input = document.createElement('input');
  input.setAttribute('id', 'ppid-query');
  input.onchange = (event)=>{
    ppid = event.target.value;
  };

  const form = document.createElement('form');
  form.appendChild(input);
  form.appendChild(button);
  form.appendChild(output);

  document.querySelector('#queryPpid').insertAdjacentElement('afterend', form);
}


/**
 * createUpdateForm()
 * Creates a form, and appends it to the DOM after #initiateLink.
 * Used for querying entitlements from the api
 */
function createUpdateForm() {
  let ppid = '';

  const output = document.createElement('pre');
  const code = document.createElement('code');
  code.classList.add('hljs', 'language-json');

  const button = document.createElement('button');
  button.innerText = 'Update Entitlements for PPID';
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    const loader = new Loader(output);
    loader.start();
    const entitlements = await updateEntitlementsForPpid(ppid);
    const textString = JSON.stringify(entitlements, null, 2);
    const formattedTextString = hljs.highlight(textString, {language: 'json'})
    const textNodeFromString = document.createRange().createContextualFragment(
        formattedTextString.value)
    code.append(textNodeFromString)
    loader.stop();
    output.append(code)
  });

  const input = document.createElement('input');
  input.setAttribute('id', 'ppid-query');
  input.onchange = (event) => {
    ppid = event.target.value;
  };

  const form = document.createElement('form');
  form.appendChild(input);
  form.appendChild(button);
  form.appendChild(output);

  document.querySelector('#updatePpid').insertAdjacentElement('afterend', form);
}

/**
 * queryEntitlementsForPpid(ppid)
 * @param {string} ppid The ppid of the subscriber.
 * @returns {{ppid: string}} The ppid.
 * Query entitlements for a given ppid
 */
async function queryEntitlementsForPpid(ppid) {
  const host = location.host;
  const endpoint = `api/subscription-linking/readers/${ppid}/entitlements`;
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
async function updateEntitlementsForPpid(ppid) {
  const host = location.host;
  const endpoint = `api/subscription-linking/readers/${ppid}/entitlements`;
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
 * Creates an eventManager that listens to events fired by swg.js
 */
function analyticsEventLogger(subs, eventHandler) {
  subs.getEventManager().then(manager => {
      manager.registerEventListener((event) => {
        eventHandler.logEvent(event);

        const intent = eventHandler.determineIntent();
        if(intent.determination !== undefined) {
          console.debug(intent.determination);
        }

      })
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const eventHandler = new AnalyticsEventHandler();

  createForm(eventHandler);
  createQueryForm();
  createUpdateForm();
  (self.SWG = self.SWG || []).push(subscriptions => {
    subscriptions.init('process.env.PUBLICATION_ID');
    analyticsEventLogger(subscriptions, eventHandler);
  });
});
