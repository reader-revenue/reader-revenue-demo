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
  queryLocalEntitlements, 
  queryLocalEntitlementsPlans,
  queryMemberData
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
    const entitlements = await queryLocalEntitlements(accessToken);
    loader.stop();
    insertHighlightedJson(
        '#GISOutput', entitlements, 'Manually queried entitlements');
  };
  button.innerText = 'Query entitlements';
  document.querySelector(selector).appendChild(button);
}

/**
 * renderFetchEntitlementsPlansButton
 * Creates a button to fetch entitlements manually
 * @param {string} selector
 */
function renderFetchEntitlementsPlansButton(selector) {
  const accessToken = getAuthzCred('accessToken');
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#GISOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const entitlements = await queryLocalEntitlements(accessToken);
    const readerId = entitlements.entitlements[0].readerId;
    const entitlementsplans =
        await queryLocalEntitlementsPlans(accessToken, readerId);
    loader.stop();
    insertHighlightedJson(
        '#GISOutput', entitlementsplans, 'Manually queried entitlementsplans');
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
  const accessToken = getAuthzCred('accessToken');
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.onclick = async () => {
    const loaderOutput = document.createElement('div');
    document.querySelector('#GISOutput').append(loaderOutput);
    const loader = new Loader(loaderOutput);
    loader.start();
    const entitlements = await queryLocalEntitlements(accessToken);
    const readerId = entitlements.entitlements[0].readerId;
    const readerData = await queryMemberData(accessToken, readerId);
    loader.stop();
    insertHighlightedJson(
        '#GISOutput', readerData, 'Member data for the current user');
  };
  button.innerText = 'Query member data';
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
  renderFetchEntitlementsPlansButton,
  renderFetchMemberButton,
  renderRevokeButton
};