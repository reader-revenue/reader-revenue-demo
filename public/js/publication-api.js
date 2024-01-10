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

import {renderButton, renderFetchEntitlementsButton, renderFetchEntitlementsPlansButton, renderRefreshButton, renderRevokeButton} from './publication-api-buttons.js';
import {initializeClient} from './publication-api-google-client.js';
import {handleCachedCredentials, handleRedirectFromOAuth} from './publication-api-handlers.js';
import {hasAuthzCred} from './publication-api-storage.js';

document.addEventListener('DOMContentLoaded', async function() {
  initializeClient();
  renderButton('#siwgButton .button');
  if (hasAuthzCred('accessToken')) {
    renderFetchEntitlementsPlansButton('#entitlementsPlans .button');
    document.querySelector('#entitlementsPlans').classList.remove('hidden');
    renderRevokeButton('#revokeButton .button');
    document.querySelector('#revokeButton').classList.remove('hidden');
    renderFetchEntitlementsButton('#accessToken .button');
    document.querySelector('#accessToken').classList.remove('hidden');
  }

  // handle redirect
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('state') === 'redirect_from_gis_authz_client') {
    handleRedirectFromOAuth(urlParams.get('code'));
  }

  if (hasAuthzCred('refreshToken')) {
    handleCachedCredentials();
    renderRefreshButton('#refreshButton .button');
    document.querySelector('#refreshButton').classList.remove('hidden');
  }
});
