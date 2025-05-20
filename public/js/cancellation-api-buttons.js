/**
 * Copyright 2025 Google LLC
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
import {insertHighlightedJson, Loader, createInput, createForm, createButton} from './utils.js';

let readerId, orderId, entitlementsPlanId = '';
let publicationId = 'process.env.PUBLICATION_ID';

/**
 * renderPublicationIdForm
 * Creates a button to set a PublicationId
 * @param {string} selector
 */
function renderPublicationIdForm(selector) {
  const input = createInput(
    publicationId, 
    'publicationId', 
    'id-input', 
    'Paste publicationId here',
    (newValue) => {
      publicationId = newValue;
      handleCancelButtonAvailability();
      handleRefundButtonAvailability();
    }
  );
  const form = createForm([input])
  document.querySelector(selector).appendChild(form);
}

/**
 * renderReaderIdForm
 * @param {string} selector
 */
function renderReaderIdForm(selector) {
  const input = createInput(
    '', 
    'readerId', 
    'id-input', 
    'Paste readerId here',
    (newValue) => {
      readerId = newValue;
      handleCancelButtonAvailability();
      handleRefundButtonAvailability();
    }
  );
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * @param {string} selector
 */
function renderEntitlementsPlanIdForm(selector) {
  const input = createInput(
    '', 
    'entitlementsPlansId', 
    'id-input',
    'Paste readerId here',
    (newValue) => {
      entitlementsPlanId = event.target.value;
      handleCancelButtonAvailability();
    }
  );
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * @param {string} selector
 */
function renderOrderIdForm(selector) {
  const input = createInput(
    '', 
    'orderId', 
    'id-input',
    'Paste orderId here',
    (newValue) => {
      orderId = newValue;
      handleRefundButtonAvailability();
    }
  );
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**--------------------buttons--------------------**/
/**
 * Creates a button to cancel entitlements plans
 * @param {string} selector
 */
function renderCancelEntitlementsPlansButton(selector) {
  const button = createButton('Cancel Entitlements Plans', 'cancelButton', 'btn-primary', true,
    async () => {
      const loaderOutput = document.createElement('div');
      document.querySelector('#APIOutput').append(loaderOutput);
      const loader = new Loader(loaderOutput);
      loader.start();
      const entitlementsplans =
          await cancelEntitlementsPlans(publicationId, readerId, entitlementsPlanId);
      loader.stop();
      insertHighlightedJson(
          '#APIOutput', entitlementsplans, 'Cancelled entitlementsplans for the given <code>planId</code>');
    }
  );
  document.querySelector(selector).appendChild(button);
}

/**
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderRefundOrderButton(selector) {
  const button = createButton('Refund Order', 'refundButton', 'btn-primary', true,
    async () => {
      const loaderOutput = document.createElement('div');
      document.querySelector('#APIOutput').append(loaderOutput);
      const loader = new Loader(loaderOutput);
      loader.start();
      const readerData = await refundOrders(publicationId, readerId, orderId);
      loader.stop();
      insertHighlightedJson(
          '#APIOutput', readerData, 'Refunded order data for given <code>orderId</code>');
    }
  );
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
