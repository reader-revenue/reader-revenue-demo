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
import {insertHighlightedJson, Loader} from './utils.js';

// Global reader_id used by helper functions
let readerId = undefined;
let publicationId = 'process.env.PUBLICATION_ID';

/**
 * renderReaderIdForm
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderReaderIdForm(selector) {
  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Paste readerId here');
  input.setAttribute('id', 'readerId');

  const form = document.createElement('form');
  form.appendChild(input);

  // Use the form input to update readerId
  input.onchange = (event)=>{
    readerId = event.target.value;

    // Set the availability of buttons based on readerId
    document.querySelectorAll('.btn').forEach((button)=>{
      if(readerId === '' || readerId === undefined) {
        button.setAttribute('disabled','true');
      } else {
        button.removeAttribute('disabled');
      }
    })
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

  // Use the form input to update readerId
  input.onchange = (event)=>{
    publicationId = event.target.value;

    // Set the availability of buttons based on publicationId
    document.querySelectorAll('.btn').forEach((button)=>{
      if(publicationId === '' || publicationId === undefined) {
        button.setAttribute('disabled','true');
      } else {
        button.removeAttribute('disabled');
      }
    })
    console.log(`publicationId updated to ${publicationId}`);
  };

  document.querySelector(selector).appendChild(form);
}

/**
 * renderFetchEntitlementsPlansButton
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderFetchEntitlementsPlansButton(selector) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.setAttribute('disabled','true');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#APIOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const entitlementsplans =
        await queryLocalEntitlementsPlans(publicationId, readerId);
    loader.stop();
    insertHighlightedJson(
        '#APIOutput', entitlementsplans, 'Manually queried entitlementsplans for the given <code>readerId</code>');
  };
  button.innerText = 'Query entitlement plans';
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchMemberButton
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderFetchMemberButton(selector) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.setAttribute('disabled','true');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#APIOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const readerData = await queryMemberData(publicationId, readerId);
    loader.stop();
    insertHighlightedJson(
        '#APIOutput', readerData, 'Member data for given <code>readerId</code>');
  };
  button.innerText = 'Query member data';
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchOrderButton
 * Creates a button to fetch order details manually
 * @param {string} selector
 */
function renderFetchOrderButton(selector) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.setAttribute('disabled','true');
  button.onclick = async () => {
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
  };
  button.innerText = 'Query order data';
  document.querySelector(selector).appendChild(button);
}

export {
  renderReaderIdForm,
  renderFetchEntitlementsPlansButton,
  renderFetchMemberButton,
  renderFetchOrderButton,
  renderPublicationIdForm
};