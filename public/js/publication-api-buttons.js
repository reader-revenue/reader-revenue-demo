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
  exchangeAuthCodeForTokens, 
  exchangeRefreshTokenForTokens, 
  queryLocalEntitlements
} from './publication-api-entitlements.js';
import {getAuthzCred, revokeAuthCode, setAuthzCred} from './publication-api-storage.js';
import {insertHighlightedJson, Loader} from './utils.js';

/**
 * renderButton
 * Renders a GIS button
 * @param {string} selector
 */
function renderButton(selector) {
  google.accounts.id.renderButton(
      document.querySelector(selector), {theme: 'outline', size: 'large'});
}

/**
 * renderRefreshButton
 * Creates a button to revoke authorization
 * @param {string} selector
 */
function renderRefreshButton(selector) {
  const refreshToken = getAuthzCred('refreshToken');
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#GISOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const tokens = await exchangeRefreshTokenForTokens(refreshToken);
    setAuthzCred('accessToken', tokens.access_token);
    loader.stop();
    insertHighlightedJson('#GISOutput', tokens, 'Refresh token');
  };
  button.innerText = 'Refresh tokens';
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchEntitlementsButton
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderFetchEntitlementsButton(selector) {
  const accessToken = getAuthzCred('accessToken');
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#GISOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const result = await queryLocalEntitlements(accessToken);
    if(result.entitlements?.length > 0){
      // if the user has any entitlements, store it in the local storage 
      // so that the readerId can be automatically filled in the field for other demos (Monetization API, Cancellation API etc.)  
      localStorage.setItem('readerId', result.entitlements[0].readerId);
    }
    loader.stop();
    insertHighlightedJson(
        '#GISOutput', result, 'Manually queried entitlements');
  };
  button.innerText = 'Query entitlements';
  document.querySelector(selector).appendChild(button);
}

/**
 * renderRevokeButton
 * Creates a button to revoke authorization
 * @param {string} selector
 */
function renderRevokeButton(selector) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.onclick = revokeAuthCode;
  button.innerText = 'Revoke tokens';
  document.querySelector(selector).appendChild(button);
}

export {
  renderButton,
  renderRefreshButton,
  renderFetchEntitlementsButton,
  renderRevokeButton
};