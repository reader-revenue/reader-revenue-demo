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

/**
 * exchangeAuthCodeForTokens
 * Exchange authorization code with access+refresh token
 * @param {string} code
 * @returns {{object}}
 */
async function exchangeAuthCodeForTokens(code) {
  const redirect = `${location.origin}/reference/publication-api`;
  const url = `${location.origin}/api/publication/exchange`;
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({code, redirect})
  };

  try {
    const response = await fetch(url, requestOptions);
    return await response.json();
  } catch (e) {
    console.log('Error fetching data', e);
    throw e;
  }
}

/**
 * exchangeRefreshTokenForTokens
 * @param {string} refreshToken
 * @returns {{Object}} tokens
 */
async function exchangeRefreshTokenForTokens(refreshToken) {
  const url = `${location.origin}/api/publication/refresh`;
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({refreshToken})
  };

  try {
    const response = await fetch(url, requestOptions);
    return await response.json();
  } catch (e) {
    console.log('Error fetching data', e);
    throw e;
  }
}

/**
 * queryLocalEntitlements
 * Queries the Publication API, but via a local endpoint
 * @param {string} accessToken
 * @returns {{object}}
 */
async function queryLocalEntitlements(accessToken) {
  const url = `${location.origin}/api/publication/entitlements`;
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({accessToken})
  };
  const entitlements = await fetch(url, requestOptions).then(r => r.json());
  return entitlements;
}

export {
  exchangeAuthCodeForTokens,
  exchangeRefreshTokenForTokens,
  queryLocalEntitlements
};