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

  document.querySelector('#revokeButton').classList.add('displayed');
}

export {handleRedirectFromOAuth, handleCachedCredentials};