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

import {queryLocalEntitlementsPlans, queryMemberData, queryOrderData} from './monetization-api-methods.js';
import {createInput, createForm, createButton, executeApiCall} from './utils.js';

// Global variables
const monetizationState = {
  readerId: localStorage.getItem('readerId') || '',
  publicationId: 'process.env.PUBLICATION_ID'
};

/**
 * renderReaderIdForm
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderReaderIdForm(selector) {
  const readerIdInput = createInput({
    'initialValue': monetizationState.readerId, 
    'id': 'readerId', 
    'classNames': ['id-input'], 
    'placeHolder': 'Paste readerId here', 
    'callback': (newValue)=> {
      monetizationState.readerId = newValue;
      handleButtonAvailability();
    }
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
  const publicationIdInput = createInput({
    'initialValue': monetizationState.publicationId, 
    'id': 'publicationId', 
    'classNames': ['id-input'], 
    'placeHolder': 'Paste publicationId here', 
    'callback': (newValue)=> {
      monetizationState.publicationId = newValue;
      handleButtonAvailability();
    }
  });
  const form = createForm([publicationIdInput]);
  document.querySelector(selector).appendChild(form);
}

/**
 * check if buttons should be enabled
 */
function handleButtonAvailability(){
  document.querySelectorAll('.btn').forEach((button)=>{
    if(!monetizationState.publicationId || !monetizationState.readerId) {
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
  const button = createButton({
    'buttonText':'Query entitlement plans', 
    'classNames':['btn', 'btn-primary'], 
    'disable': !monetizationState.readerId, 
    'callback': () => executeApiCall(
      () => queryLocalEntitlementsPlans(monetizationState.publicationId, monetizationState.readerId),
      'Manually queried entitlementsplans for the given <code>readerId</code>'
    )
  });
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchMemberButton
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderFetchMemberButton(selector) {
  const button = createButton({
    'buttonText':'Query member plans', 
    'classNames':['btn', 'btn-primary'], 
    'disable': !monetizationState.readerId, 
    'callback': () => executeApiCall(
      () => queryMemberData(monetizationState.publicationId, monetizationState.readerId),
      'Member data for given <code>readerId</code>'
    )
  });
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchOrderButton
 * Creates a button to fetch order details manually
 * @param {string} selector
 */
function renderFetchOrderButton(selector) {
  const button = createButton({
    'buttonText':'Query order plans', 
    'classNames':['btn', 'btn-primary'], 
    'disable': !monetizationState.readerId, 
    'callback': () => {
      executeApiCall(
      () => queryOrderData(monetizationState.publicationId, monetizationState.readerId),
      'Order data for the given <code>readerId</code>\'s most recent order that is not canceled.'
    )}
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
