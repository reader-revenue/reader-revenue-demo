/**
 * Copyright 2023 Google LLC
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

/**
 * @fileoverview This client-side js file to initiate and manage account
 * linking state.
 */
import {insertHighlightedJson} from './utils.js';
import {accountLinkingPersistence} from './account-linking-persistence.js';

async function handleSavedSubscription(accessToken) {
  return {token: accessToken};
}

(self.SWG = self.SWG || []).push(async function(subscriptions) {

  //initialize Account Linking helper 
  const accountLinkingState = new accountLinkingPersistence;
  
  //initialize SwG
  subscriptions.init('process.env.PUBLICATION_ID');
  
  //query publisher local entitlements

  //show local entitlements
  if (accountLinkingState.linked === true) {
    const endpoint = `/api/account-linking?access_token=${accountLinkingState.accessToken}`;
    const localEntitlements = await fetch(endpoint).then(r=>r.json());
    insertHighlightedJson('#output', localEntitlements, `Publisher entitlements for accessToken:${accountLinkingState.accessToken}`);
  }

  //show account linking local state
  insertHighlightedJson('#output', accountLinkingState.state, "Local Account Linking State");

  //update the state of buttons
  const linkButton = document.querySelector('#accountLink');
  const resetButton = document.querySelector('#accountLinkReset');

  resetButton.onclick = () => {
    accountLinkingState.reset();
    location.reload()
  }

  linkButton.onclick = async ()=>{
    const response = await subscriptions.saveSubscription(()=>{
      return handleSavedSubscription(accountLinkingState.accessToken);
    })
    accountLinkingState.declined = !response;
    accountLinkingState.linked = response;

    insertHighlightedJson('#output', {response}, "Account Linking Response");
  }

  if(accountLinkingState.declined === true) {
    linkButton.setAttribute('disabled', true);
    linkButton.textContent = "User previously declined to link.";
  }

  if(accountLinkingState.linked === true) {
    linkButton.textContent = "User previously link. Link again?";
  }

});
