import {redirect} from './utils.js';


/**
 * getAuthzCreds
 * Get authorization information in localStorage
 * @returns {{Object}}
 */
function getAuthzCreds() {
  try {
    return {
      authorizationCode: localStorage.getItem('authorizationCode'),
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  } catch (e) {
    console.log('Error fetching data from localStorage', e);
    return {};
  }
}

/**
 * getAuthzCred
 * Get authorization information in localStorage for a field
 * @param {string} field
 * @returns {string}
 */
function getAuthzCred(field) {
  try {
    return localStorage.getItem(field);
  } catch (e) {
    console.log(`Error fetching data from localStorage for ${field}`, e);
    return undefined;
  }
}

/**
 * hasAuthzCred
 * Test for authorization information in localStorage for a field
 * @param {string} field
 * @returns {boolean}
 */
function hasAuthzCred(field) {
  try {
    const data = localStorage.getItem(field);

    return data && data !== '' && data !== undefined && data !== null;
  } catch (e) {
    console.log('Error fetching data from localStorage', e);
    return false;
  }
}

/**
 * setAuthzCreds
 * Stores authorization information in localStorage
 * @param {string} authorizationCode
 * @param {string} accessToken
 * @param {string} refreshToken
 */
function setAuthzCreds(authorizationCode, accessToken, refreshToken) {
  console.log(
      'setting localStorage with',
      {authorizationCode, accessToken, refreshToken});
  localStorage.setItem('authorizationCode', authorizationCode);
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * setAuthzCred
 * Stores authorization information in localStorage for a field
 * @param {string} field
 * @param {string} value
 */
function setAuthzCred(field, value) {
  console.log('setting localStorage with', {field, value});
  localStorage.setItem(field, value);
}

/**
 * removeAuthZCreds
 * Removes authorization information from localStorage
 */
function removeAuthZCreds() {
  localStorage.removeItem('authorizationCode');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * removeAuthZCred
 * Removes authorization information from localStorage for a field
 * @param {string} field
 */
function removeAuthZCred(field) {
  localStorage.removeItem(field);
}

/**
 * revokeAuthCode
 * Revokes authorization
 */
function revokeAuthCode() {
  const destination = `${location.origin}/reference/publication-api`;
  console.log('Revoking Code/Token');
  google.accounts.oauth2.revoke(getAuthzCred('refreshToken'), done => {
    console.log(done.error);
  });
  removeAuthZCreds();
  redirect('revokeAuthCode', destination);
}

export {
  setAuthzCreds,
  setAuthzCred,
  removeAuthZCreds,
  revokeAuthCode,
  getAuthzCreds,
  getAuthzCred,
  hasAuthzCred
};