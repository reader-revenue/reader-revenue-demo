import {exchangeAuthCodeForTokens, exchangeRefreshTokenForTokens, queryLocalEntitlements, queryLocalEntitlementsPlans} from './publication-api-entitlements.js';
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
  button.innerText = 'Refresh tokens with refreshToken';
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

    const readerId = entitlements.entitlements[0].readerId;
    const entitlementsplans =
        await queryLocalEntitlementsPlans(accessToken, readerId);

    loader.stop();
    insertHighlightedJson(
        '#GISOutput', entitlements, 'Manually queried entitlements');
    insertHighlightedJson(
        '#GISOutput', entitlementsplans, 'Manually queried entitlementsplans');
  };
  button.innerText = 'Query entitlements with accessToken';
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
    const readerId = '4df0faf26630a56329a137ccbfc5d464';  // replace
    const entitlements =
        await queryLocalEntitlementsPlans(accessToken, readerId);
    // const readerId = entitlements.entitlements[0].readerId;
    const entitlementsplans =
        await queryLocalEntitlementsPlans(accessToken, readerId);

    loader.stop();
    insertHighlightedJson(
        '#GISOutput', entitlements, 'Manually queried entitlements');
    insertHighlightedJson(
        '#GISOutput', entitlementsplans, 'Manually queried entitlementsplans');
  };
  button.innerText = 'Query plan entitlements with accessToken';
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
  renderRevokeButton
};