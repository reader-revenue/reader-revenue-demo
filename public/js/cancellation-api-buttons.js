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
  queryLocalEntitlementsPlans,
} from './monetization-api-methods.js';

import {
  cancelEntitlementsPlans,
  refundOrders
} from './cancellation-api-methods.js';
import {insertHighlightedJson, Loader, createInput, createForm, createButton} from './utils.js';

let readerId = '';
let orderId = ''; 
let entitlementsPlanId = '';
let publicationId = 'process.env.PUBLICATION_ID';

/** 
 * Auto-filling readerId, publicationId, and entitlementsPlanId if readerId is stored in localstorage
 */
async function autoFillIds(){
  if(localStorage.getItem('readerId')){
    readerId = localStorage.getItem('readerId');
    const entitlementsplans = await queryLocalEntitlementsPlans(publicationId, readerId);
    // filterling out cancelled / to-be-cancelled entitlementsplans
    const filteredPlans = entitlementsplans?.userEntitlementsPlans?.filter(plan => {
      return plan.recurringPlanDetails.recurringPlanState != 'CANCELED' &&
             plan.recurringPlanDetails.recurringPlanState != 'WAITING_TO_CANCEL';
    });
    if(filteredPlans?.length>0){
      entitlementsPlanId = filteredPlans[0].planId;
      orderId = filteredPlans[0].purchaseInfo.latestOrderId;   
      showCancellablePlans(filteredPlans);
    }
  } 
}

/** 
 * Showing cancellable plans 
 * @param {Array} filteredPlans
 */
function showCancellablePlans(filteredPlans){
  const planList = document.createElement('ul')
  filteredPlans.map((plan)=> { 
    const planItem = document.createElement('li')
    planItem.innerHTML = `EntitlementsPlanID: ${plan.planId.bold()} (status: ${plan.recurringPlanDetails.recurringPlanState})`;
    planList.appendChild(planItem);
  });
  const title = document.createElement('p');
  title.innerText = 'Cancellable Plans';
  title.appendChild(planList);
  document.querySelector('#cancellablePlans').appendChild(title);
}

/**
 * renderPublicationIdForm
 * Creates a button to set a PublicationId
 * @param {string} selector
 */
function renderPublicationIdForm(selector) {
  const inputOptions = {
    'initialValue': publicationId, 
    'id': 'publicationId', 
    'classNames': ['id-input'], 
    'placeHolder': 'Paste publicationId here',
    'callback': (newValue) => {
      publicationId = newValue;
      handleCancelButtonAvailability();
      handleRefundButtonAvailability();
    }
  };
  const input = createInput(inputOptions);
  const form = createForm([input])
  document.querySelector(selector).appendChild(form);
}

/**
 * renderReaderIdForm
 * @param {string} selector
 */
function renderReaderIdForm(selector) {
  const inputOptions = {
  'initialValue': readerId, 
  'id': 'readerId', 
  'classNames': ['id-input'], 
  'placeHolder': 'Paste readerId here',
  'callback': (newValue) => {
    readerId = newValue;
    handleCancelButtonAvailability();
    handleRefundButtonAvailability();
    } 
  };
  const input = createInput(inputOptions);
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * @param {string} selector
 */
function renderEntitlementsPlanIdForm(selector) {
  const inputOptions = {
    'initialValue': entitlementsPlanId, 
    'id': 'entitlementsPlansId', 
    'classNames': ['id-input'], 
    'placeHolder': 'Paste planId here',
    'callback':     (newValue) => {
      entitlementsPlanId = newValue;
      handleCancelButtonAvailability();
    }
  };
  const input = createInput(inputOptions);
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * @param {string} selector
 */
function renderOrderIdForm(selector) {
  const inputOptions = {
    'initialValue': orderId, 
    'id': 'orderId', 
    'classNames': ['id-input'], 
    'placeHolder': 'Paste orderId here',
    'callback':     (newValue) => {
      orderId = newValue;
      handleRefundButtonAvailability();
    }
  };
  const input = createInput(inputOptions);
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**--------------------buttons--------------------**/
/**
 * Creates a button to cancel entitlements plans
 * @param {string} selector
 */
function renderCancelEntitlementsPlansButton(selector) {
  const buttonOptions = {
    'buttonText': 'Cancel Entitlements Plans',
    'id': 'cancelButton',
    'classNames': ['btn','btn-primary'],
    'disable': !publicationId || !readerId || !entitlementsPlanId,
    'callback': async () => {
      const loaderOutput = document.createElement('div');
      document.querySelector('#APIOutput').append(loaderOutput);
      const loader = new Loader(loaderOutput);
      loader.start();
      const entitlementsplans =
          await cancelEntitlementsPlans(publicationId, readerId, entitlementsPlanId, !!document.getElementById('cancelImmediately').checked);
      loader.stop();
      insertHighlightedJson(
          '#APIOutput', entitlementsplans, 'Cancelled entitlementsplans for the given <code>planId</code>');
    }
  };
  const button = createButton(buttonOptions);
  document.querySelector(selector).appendChild(button);
}

/**
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderRefundOrderButton(selector) {
  const buttonOptions = {
    'buttonText': 'Refund Order',
    'id': 'refundButton',
    'classNames': ['btn','btn-primary'],
    'disable': !publicationId || !readerId || !orderId,
    'callback': async () => {
        const loaderOutput = document.createElement('div');
        document.querySelector('#APIOutput').append(loaderOutput);
        const loader = new Loader(loaderOutput);
        loader.start();
        const readerData = await refundOrders(publicationId, readerId, orderId);
        loader.stop();
        insertHighlightedJson(
            '#APIOutput', readerData, 'Refunded order data for given <code>orderId</code>');
    }
  };
  const button = createButton(buttonOptions);
  document.querySelector(selector).appendChild(button);
};

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
  renderOrderIdForm,
  autoFillIds
};
