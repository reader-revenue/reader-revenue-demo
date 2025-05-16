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

let readerId, orderId, entitlementsPlanId = '';
let publicationId = 'process.env.PUBLICATION_ID';

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
  input.setAttribute('class', 'id-input');

  const form = document.createElement('form');
  form.appendChild(input);

  // Use the form input to update publicationId
  input.onchange = (event)=>{
    publicationId = event.target.value;
    console.log(`publicationId updated to ${publicationId}`);
    handleCancelButtonAvailability();
    handleRefundButtonAvailability();
  };
  document.querySelector(selector).appendChild(form);
}

/**
 * renderReaderIdForm
 * @param {string} selector
 */
function renderReaderIdForm(selector) {
  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Paste readerId here');
  input.setAttribute('id', 'readerId');
  input.setAttribute('class', 'id-input');

  const form = document.createElement('form');
  form.appendChild(input);

  // Use the form input to update readerId
  input.onchange = (event)=>{
    readerId = event.target.value;
    console.log(`reader_id updated to ${readerId}`);
    handleCancelButtonAvailability();
    handleRefundButtonAvailability();
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
  input.setAttribute('class', 'id-input');

  const form = document.createElement('form');
  form.appendChild(input);

  input.onchange = (event)=>{
    entitlementsPlanId = event.target.value;
    handleCancelButtonAvailability();
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
  input.setAttribute('class', 'id-input');

  const form = document.createElement('form');
  form.appendChild(input);
  input.onchange = (event)=>{
    orderId = event.target.value;
    handleRefundButtonAvailability();
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
  button.setAttribute('id', 'cancelButton');
  button.classList.add('btn', 'btn-primary');
  button.setAttribute('disabled','true');
  
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
  button.setAttribute('id', 'refundButton');
  button.setAttribute('disabled','true');
  
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

// Set the availability of the cancel button
function handleCancelButtonAvailability(){
  const button = document.querySelector('#cancelButton');
  if(!publicationId || !readerId || !entitlementsPlanId) {
    button.setAttribute('disabled','true');
  } else {
    button.removeAttribute('disabled');
  }
}

// Set the availability of the refund button
function handleRefundButtonAvailability(){
  const button = document.querySelector('#refundButton');
  if(!publicationId || !readerId || !orderId) {
    button.setAttribute('disabled','true');
  } else {
    button.removeAttribute('disabled');
  }
}


export {
  renderCancelEntitlementsPlansButton,
  renderRefundOrderButton,
  
  renderReaderIdForm,
  renderPublicationIdForm,
  renderEntitlementsPlanIdForm,
  renderOrderIdForm
};
