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
 * @fileoverview This client-side js file to initiate and manage
 * Extended Access registration and entitlements
 */

import { insertHighlightedJson } from './utils.js';

function revokeIDToken() {
  google.accounts.id.revoke(readCookie('jwtSub'), done => {
    console.log(done.error);
  });
  eraseCookie('jwtSub');
}

function createCookie(name, value, days=15) {
  var expires = '',
      date = new Date();
  if (days) {
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toGMTString();
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name) {
    var cookies = document.cookie.split(';'),
        length = cookies.length,
        i,
        cookie,
        nameEQ = name + '=';
    for (i = 0; i < length; i += 1) {
        cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, '', -1);
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function redirect() {
  console.log("redirect happening...")
  const url = `https://play.google.com/newsstand/api/v3/articleaccess?testurl=https://${window.location.host}/extended-access/registration`;
  window.location.href = url
}

function InitGaaMetering() {
  /**
   * Publisher-defined callbacks.
   *
   * The simplest possible implementation of showPaywall, unlockArticle, openLoginPage
   * and handleSwGEntitlement. A more sophisticated implementation could fetch more data,
   * or set cookies and refresh the whole page.
   */

  // Callback that must ensure the publisher’s standard paywall is shown to the user.
  // This is used when Extended Access is not granted to the user or if the user
  // clicks “Subscribe” on the Extended Access prompt.
  // Do not copy the implementation for the callback and see documentation for your own implementation at:
  // https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation#handle-extended-access-grants
  function showPaywall() {
    console.log('Example: show paywall');
  };

  // Callback that must unlock the current article which is called when Google is
  // granting Extended Access to the user.
  // Do not copy the implementation for the callback and see documentation for your own implementation at:
  // https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation#handle-extended-access-grants
  function unlockArticle() {
    document.getElementById("paywalledContent").style.filter = "blur(0px)"
    console.log('Example: unlock article');
  };

  // Only relevant for publishers doing Subscribe with Google.
  // Callback that will be triggered if the user is a Subscribe with Google subscriber.
  // Do not copy the implementation for the callback and see documentation for your own implementation at:
  // https://developers.google.com/news/subscribe/guides/check-for-entitlements-on-web
  function handleSwGEntitlement() {
    console.log('Example: handle swg entitlement');
    unlockArticle();
  }


  /*
    * Publisher-defined promises.
    *
    * The simplest implementation of registerUserPromise, handleLoginPromise,
    * and publisherEntitlementPromise.
    */
  // Get userState by passing the gaaUser object to your registration endpoint server
  // Takes the registration JWT and returns an updated userState object for the newly registered user.
  // Do not copy the implementation for the promise and see documentation for your own implementation at:
  // https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation#handle-registration-for-new-users
  const registerUserPromise = new Promise ((resolve) => {
    GaaMetering.getGaaUserPromise().then((gaaUser) => {
      createCookie('jwtSub', gaaUser.credential.sub)

      insertHighlightedJson("#output", parseJwt(gaaUser.credential), "GAA User Credentials from the JWT")

      createCookie('jwtSub', parseJwt(gaaUser.credential).sub)
      // gaaUser - registration JWT that is returned by Sign In with Google
      // https://developers.google.com/identity/gsi/web/reference/js-reference?hl=en#credential
      const gaaUserDecoded = parseJwt(gaaUser.credential);
      // Example body of the promise returning a userState object
      const userState = {
        id: btoa(gaaUserDecoded.sub),
        registrationTimestamp: Math.round(Date.now() / 1000),
        granted: false
      };
      resolve(userState);
    });
  });

  // Allows the user to login to an existing publisher account and must resolve
  // with an updated userState object for the newly logged-in user.
  // Do not copy the implementation for the promise and see documentation for your own implementation at:
  // https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation#handle-login-for-existing-users
  const handleLoginPromise = new Promise ((resolve) => {
    GaaMetering.getLoginPromise().then(() => {
      alert('You may open your log in page');
      // Example body of the promise returning a userState object
      const userState = {
        id: 'user123456789',
        registrationTimestamp: 1647311022,
        granted: false,
      };

      insertHighlightedJson("#output", {message:"User identified via Publisher's sign in"}, "User with Publisher Login")
      resolve(userState);
    });
  });

  // Get userState by passing the gaaUser object to your registration endpoint server
  // Resolves with the current user’s entitlements from the publisher
  // Optional - required only if your userState object doesn't contain the publisherEntitlement already
  // Do not copy the implementation for the promise and see documentation for your own implementation at:
  // https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation#creating-the-users-entitlement-state
  const publisherEntitlementPromise = new Promise ((resolve) => {
    // Example body of the promise returning a publisherEntitlement object
    const publisherEntitlement = {
      granted: false,
    };
    resolve(publisherEntitlement);
  });

  // The userState object for the current user.
  // Do not copy the implementation for the callback and see documentation for your own implementation at:
  // https://developers.google.com/news/subscribe/extended-access/reference/user-state-object
  function getUserState() {
    return {
      // Commented out since we don't actually use the UserState in this demo of the
      // registration flow.
      // id: 'user123456789',
      // registrationTimestamp: 1647311022,
      // subscriptionTimestamp: 1647311062,
      // granted: true,
      // grantReason: 'SUBSCRIBER'
    };
  };

  /* Code */

  // Provide a shortcut to metering params.
  // Do not copy the constant and see documentation at:
  // https://developers.google.com/news/subscribe/extended-access/reference/google-article-access-parameters
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.has('metering')) {
    let newSearch = 'gaa_at=g&gaa_ts=99999999&gaa_n=n0nc3&gaa_sig=51g';
    location.search = newSearch;
  }


  // Array with all allowed hosts that can refer users to your article pages.
  // This is used if you redirect users or refresh the page during the Handle registration
  // for new users or Handle login for existing users flows.
  // Do not copy the constant and see documentation at:
  // https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation#initialize-the-extended-access-library
  const allowedReferrers = ["ea-upgrade-dot-reader-revenue-demo.ue.r.appspot.com",
                            "ea-upgrade-to-rrme-dot-reader-revenue-demo.ue.r.appspot.com",
                            "b2607f8b04800100000144d90c0a821641f90000000000000000001.proxy.googlers.com"]

  // User's Showcase entitlement determined on your server
  // Optional - server side only
  // Do not copy the constant and see documentation at:
  // https://developers.google.com/news/subscribe/guides/check-for-entitlements-on-web
  const showcaseEntitlement = urlParams.get("showcaseEntitlement");

  // Do not copy the parameters bellow. See documentation at:
  // https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation#initialize-the-extended-access-library

  GaaMetering.init({
    googleApiClientId: '695298810691-sue9beofr6jstu5e227oh4jpatljlt1p.apps.googleusercontent.com',
    allowedReferrers: allowedReferrers,
    userState: getUserState(),
    unlockArticle: unlockArticle,
    showPaywall: showPaywall,
    handleSwGEntitlement: handleSwGEntitlement, // Optional - only if SwG is implemented
    registerUserPromise: registerUserPromise,
    handleLoginPromise: handleLoginPromise,
    publisherEntitlementPromise: publisherEntitlementPromise, // Optional
  });
}

document.addEventListener("DOMContentLoaded", (event) => {
  InitGaaMetering()
  document.querySelector("#redirect").onclick = redirect
  document.querySelector("#revoke").onclick = revokeIDToken
});