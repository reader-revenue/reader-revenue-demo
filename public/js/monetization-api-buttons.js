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
  queryLocalEntitlementsPlans,
  queryMemberData,
  queryOrderData
} from './monetization-api-methods.js';
import {insertHighlightedJson, Loader, createInput, createForm, createButton} from './utils.js';

// Global reader_id used by helper functions
let readerId = localStorage.getItem('readerId') || '';
let publicationId = 'process.env.PUBLICATION_ID';

/**
 * renderReaderIdForm
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderReaderIdForm(selector) {
  const readerIdInput = createInput(
    readerId, 
    'readerId', 
    'id-input', 
    'Paste readerId here', 
    (newValue)=> {
      readerId = newValue;
      handleButtonAvailability();
    });
  const form = createForm([readerIdInput]);
  document.querySelector(selector).appendChild(form);
}

/**
 * renderPublicationIdForm
 * Creates a button to set a PublicationId
 * @param {string} selector
 */
function renderPublicationIdForm(selector) {
  const publicationIdInput = createInput(
    publicationId, 
    'publicationId', 
    'id-input', 
    'Paste publicationId here', 
    (newValue)=> {
      publicationId = newValue;
      handleButtonAvailability();
    });
  const form = createForm([publicationIdInput]);
  document.querySelector(selector).appendChild(form);
}

/**
 * check if buttons should be enabled
 */
function handleButtonAvailability(){
  document.querySelectorAll('.btn').forEach((button)=>{
    if(!publicationId || !readerId) {
      button.setAttribute('disabled','true');
    } else {
      button.removeAttribute('disabled');
    }
  });
}

/**
 * renderFetchEntitlementsPlansButton
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderFetchEntitlementsPlansButton(selector) {
  const button = createButton('Query entitlement plans', '', ['btn', 'btn-primary'], !!readerId, async() =>{
    const loaderOutput = document.createElement('div');
    document.querySelector('#APIOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const entitlementsplans =
        await queryLocalEntitlementsPlans(publicationId, readerId);
    loader.stop();
    insertHighlightedJson(
        '#APIOutput', entitlementsplans, 'Manually queried entitlementsplans for the given <code>readerId</code>');
  });
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchMemberButton
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderFetchMemberButton(selector) {
  const button = createButton('Query member data', '', ['btn', 'btn-primary'], !!readerId, async() =>{
    button.classList.add('btn', 'btn-primary');
    button.setAttribute('disabled','true');
      const loaderOutput = document.createElement('div');
      document.querySelector('#APIOutput').append(loaderOutput);
      const loader = new Loader(loaderOutput);
      loader.start();
      const readerData = await queryMemberData(publicationId, readerId);
      loader.stop();
      insertHighlightedJson(
          '#APIOutput', readerData, 'Member data for given <code>readerId</code>');
  });
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchOrderButton
 * Creates a button to fetch order details manually
 * @param {string} selector
 */
function renderFetchOrderButton(selector) {
  const button = createButton('Query order data', '', ['btn', 'btn-primary'], !!readerId, async() =>{
    const loaderOutput = document.createElement('div');
    document.querySelector('#APIOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const entitlementsplans = await queryLocalEntitlementsPlans(publicationId, readerId);
    const filteredPlans = entitlementsplans.userEntitlementsPlans.filter((plan)=>{
      return plan.recurringPlanDetails.recurringPlanState != 'CANCELED'
    })
    const orderId = filteredPlans[0].purchaseInfo.latestOrderId;
    const readerData = await queryOrderData(publicationId, readerId, orderId);
    loader.stop();
    insertHighlightedJson(
        '#APIOutput', readerData, 'Order data for the given <code>readerId</code>\'s most recent order that is not canceled.');
  });
  document.querySelector(selector).appendChild(button);
}

export {
  renderReaderIdForm,
  renderFetchEntitlementsPlansButton,
  renderFetchMemberButton,
  renderFetchOrderButton,
  renderPublicationIdForm
};
