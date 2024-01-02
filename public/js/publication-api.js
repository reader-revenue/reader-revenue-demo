import {renderButton, renderFetchEntitlementsButton, renderFetchEntitlementsPlansButton, renderRefreshButton, renderRevokeButton} from './publication-api-buttons.js';
import {initializeClient} from './publication-api-google-client.js';
import {handleCachedCredentials, handleRedirectFromOAuth} from './publication-api-handlers.js';
import {hasAuthzCred} from './publication-api-storage.js';

document.addEventListener('DOMContentLoaded', async function() {
  initializeClient();
  renderButton('#siwgButton');
  if (hasAuthzCred('accessToken')) {
    renderFetchEntitlementsPlansButton('#entitlementsPlans');
    renderRevokeButton('#revokeButton');
    renderFetchEntitlementsButton('#accessToken');
  }

  // handle redirect
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('state') === 'redirect_from_gis_authz_client') {
    handleRedirectFromOAuth(urlParams.get('code'));
  }

  if (hasAuthzCred('refreshToken')) {
    handleCachedCredentials();
    renderRefreshButton('#refreshButton');
  }
});
