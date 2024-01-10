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

import {exchangeAuthCodeForTokens, queryLocalEntitlements} from './publication-api-entitlements.js';
import {getAuthzCred, setAuthzCreds} from './publication-api-storage.js';
import {insertHighlightedJson, redirect} from './utils.js';

/**
 * handleRedirectFromOAuth
 * @param {string} authorization_code
 */
async function handleRedirectFromOAuth(authorization_code) {
  console.log('Redirect from OAuth endpoint');

  // obtain, store access token, display results
  const tokens = await exchangeAuthCodeForTokens(authorization_code);

  console.log({tokens, authorization_code});

  // store it all
  setAuthzCreds(authorization_code, tokens.access_token, tokens.refresh_token);
  redirect(
      'state === redirect_from_gis_authz_client',
      `${location.origin}/reference/publication-api`);
}

/**
 * handleCachedCredentials
 */
async function handleCachedCredentials() {
  console.log(getAuthzCred('refreshToken'));
  const entitlements =
      await queryLocalEntitlements(getAuthzCred('accessToken'));

  insertHighlightedJson(
      '#GISOutput', entitlements, 'Entitlements from cached credentials');

}

export {handleRedirectFromOAuth, handleCachedCredentials};