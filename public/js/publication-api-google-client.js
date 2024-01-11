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

import {getAuthzCred} from './publication-api-storage.js';
import {parseJwt} from './utils.js';

/**
 * @fileoverview Description of this file.
 */

const REQUESTED_SCOPES = [
  'email', 'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.readonly'
];

const REQUESTED_SCOPE = REQUESTED_SCOPES.join(' ');
const REDIRECT = `${location.origin}/reference/publication-api`;
const OAUTH_CLIENT_ID =
    'process.env.OAUTH_CLIENT_ID';

/**
 * initializeClient
 * Initializes a GIS authentication client
 */
function initializeClient() {
  // Initialise the GIS Authentication client
  google.accounts.id.initialize(
      {client_id: OAUTH_CLIENT_ID, callback: handleClientInitialization});
}

/**
 * initGISAuthCodeClientRedirect
 * GIS Authorization client
 * Create a GIS client
 * @param {string} hint
 * @returns {{object}}
 */
function initGISAuthCodeClientRedirect(hint) {
  console.log('Redirect from initGISAuthCodeClientRedirect');
  return google.accounts.oauth2.initCodeClient({
    client_id: OAUTH_CLIENT_ID,
    scope: REQUESTED_SCOPE,
    hint: hint,
    ux_mode: 'redirect',
    redirect_uri: REDIRECT,
    state: 'redirect_from_gis_authz_client',
    select_account: false
  });
}

/**
 * handleClientInitialization
 * @param {{Object}} response
 * Handles the response from the google.accounts.id.initialize method
 */
async function handleClientInitialization(response) {
  let parsedJwt = parseJwt(response.credential);
  let authorizationCode = getAuthzCred('authorizationCode');

  if (authorizationCode != null) {  // query directly the publication api
    console.log('AuthorizationCode found for this user in our systems.');
    // ensure it is still valid; refresh it otherwise
    const accessToken = getAuthzCred('accessToken');
    const refreshToken = getAuthzCred('refreshToken');
    console.log('Data from localStorage via initializeClient()');
    console.log({accessToken, refreshToken});

    // display to user
    insertHighlightedJson(
        '#GISOutput', getAuthzCred('refreshToken'), 'Refresh token');

    const entitlements = await queryLocalEntitlements(accessToken);

    console.log({entitlements});
    insertHighlightedJson(
        '#GISOutput', entitlements,
        'Entitlements after using the Sign-in with Google button');
  } else {  // redirect
    console.log('No authorizationCode found for this user in our systems.');
    let auth_client = initGISAuthCodeClientRedirect(parsedJwt.sub);
    auth_client.requestCode();
  }
}

export {initializeClient};