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

import {
  cancelEntitlementsPlans,
  refundOrders
} from './cancellation-api-methods.js';
import {insertHighlightedJson, Loader} from './utils.js';

let readerId = '37843b703beaf19aa8843bf9ab70e7bb';
let orderId = 'SWG.6745-3183-8280-64835';
let entitlementsPlanId = 'bee20751c9ae75214cd31dc957da2a51';
let publicationId = 'process.env.PUBLICATION_ID';

/**
 * renderReaderIdForm
 * @param {string} selector
 */
function renderReaderIdForm(selector) {
  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Paste readerId here');
  input.setAttribute('id', 'readerId');
  input.setAttribute('value', '37843b703beaf19aa8843bf9ab70e7bb');

  const form = document.createElement('form');
  form.appendChild(input);

  // Use the form input to update readerId
  input.onchange = (event)=>{
    readerId = event.target.value;
    console.log(`reader_id updated to ${readerId}`);
  };

  document.querySelector(selector).appendChild(form);
}

/**
 * renderPublicationIdForm
 * Creates a button to set a PublicationId
 * @param {string} selector
 */
function renderPublicationIdForm(selector) {
  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Paste publicationId here');
  input.setAttribute('id', 'publicationId');
  input.setAttribute('value', 'process.env.PUBLICATION_ID');

  const form = document.createElement('form');
  form.appendChild(input);

  // Use the form input to update publicationId
  input.onchange = (event)=>{
    publicationId = event.target.value;
    console.log(`publicationId updated to ${publicationId}`);
  };
  document.querySelector(selector).appendChild(form);
}

/**
 * @param {string} selector
 */
function renderEntitlementsPlanIdForm(selector) {
  console.log('renderEntitlementsPlanIdForm selector - ', selector);
  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Paste entitlementsPlansId here');
  input.setAttribute('id', 'entitlementsPlansId');
  input.setAttribute('value', 'bee20751c9ae75214cd31dc957da2a51');
  
  const form = document.createElement('form');
  form.appendChild(input);

  input.onchange = (event)=>{
    entitlementsPlanId = event.target.value;
  };
  document.querySelector(selector).appendChild(form);
}

/**
 * @param {string} selector
 */
function renderOrderIdForm(selector) {
  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Paste entitlementsPlansId here');
  input.setAttribute('id', 'entitlementsPlansId');
  input.setAttribute('value', 'SWG.6745-3183-8280-64835');
  
  const form = document.createElement('form');
  form.appendChild(input);
  input.onchange = (event)=>{
    orderId = event.target.value;
  };
  document.querySelector(selector).appendChild(form);
}

/**--------------------buttons--------------------**/

/**
 * Creates a button to cancel entitlements plans
 * @param {string} selector
 */
function renderCancelEntitlementsPlansButton(selector) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#APIOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const entitlementsplans =
        await cancelEntitlementsPlans(publicationId, readerId, entitlementsPlanId);
    loader.stop();
    insertHighlightedJson(
        '#APIOutput', entitlementsplans, 'Cancelled entitlementsplans for the given <code>planId</code>');
  };
  button.innerText = 'Cancel Entitlements Plans';
  document.querySelector(selector).appendChild(button);
}

/**
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderRefundOrderButton(selector) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#APIOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const readerData = await refundOrders(publicationId, readerId, orderId);
    loader.stop();
    insertHighlightedJson(
        '#APIOutput', readerData, 'Refunded order data for given <code>orderId</code>');
  };
  button.innerText = 'Refund Order';
  document.querySelector(selector).appendChild(button);
}

export {
  renderCancelEntitlementsPlansButton,
  renderRefundOrderButton,
  
  renderReaderIdForm,
  renderPublicationIdForm,
  renderEntitlementsPlanIdForm,
  renderOrderIdForm
};