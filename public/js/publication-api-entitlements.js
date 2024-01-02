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

async function queryLocalEntitlementsPlans(accessToken, user_id) {
  const url = `${location.origin}/api/publication/entitlementsplans`;
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({accessToken, user_id})
  };
  const entitlementsplans =
      await fetch(url, requestOptions).then(r => r.json());
  return entitlementsplans;
}

export {
  exchangeAuthCodeForTokens,
  exchangeRefreshTokenForTokens,
  queryLocalEntitlements,
  queryLocalEntitlementsPlans
};