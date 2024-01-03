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
