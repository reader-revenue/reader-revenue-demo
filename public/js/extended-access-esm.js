/**
 * Copyright 2026 Google LLC
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
 * Extended Access registration and entitlements via ESM
 */

import { GaaMetering } from "process.env.SWG_JS_GAA_MJS_URL";
import { insertHighlightedJson } from "./utils.js";

async function revokeIDToken() {
  google.accounts.id.revoke(await readCookie("jwtSub"), done => {
    console.log(done.successful ? "Successfully revoked token" : done.error);
  });
  await eraseCookie("jwtSub");
}

async function createCookie(name, value, days=15) {
  const expiresInDays = days * 24 * 60 * 60 * 1000;
  const setCookie = await fetch ("/api/extended-access/cookie", {
    credentials: "include",
    headers:{
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      name, 
      value,
      expiresInDays 
    })
  })
  return setCookie;
}

async function readCookie(name) {
  const savedCookie = await fetch (`/api/extended-access/cookie/\${name}`, {
    credentials: "include"
  }).then(r=>r.json());
  try {
    return savedCookie[name];
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function eraseCookie(name) {
    await createCookie(name, "", -1);
}

function parseJwt (token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(jsonPayload);
}

function redirect() {
  console.log("redirect happening...")
  const url = `https://play.google.com/newsstand/api/v3/articleaccess?testurl=https://\${window.location.host}/extended-access/registration-esm\`;
  window.location.href = url
}

// Wait for the GAA library to be ready
await GaaMetering.ready();

/**
 * Publisher-defined callbacks.
 */
function showPaywall() {
  console.log("Example: show paywall");
};

function unlockArticle() {
  const content = document.getElementById("paywalledContent");
  if (content) content.style.filter = "blur(0px)";
  console.log("Example: unlock article");
};

function handleSwGEntitlement() {
  console.log("Example: handle swg entitlement");
  unlockArticle();
}

const registerUserPromise = new Promise ((resolve) => {
  GaaMetering.getGaaUserPromise().then(async (gaaUser) => {
    insertHighlightedJson("#output", parseJwt(gaaUser.credential), "GAA User Credentials from the JWT")
    await createCookie("jwtSub", parseJwt(gaaUser.credential).sub)
    const gaaUserDecoded = parseJwt(gaaUser.credential);
    const userState = {
      id: btoa(gaaUserDecoded.sub),
      registrationTimestamp: Math.round(Date.now() / 1000),
      granted: false
    };
    resolve(userState);
  });
});

const handleLoginPromise = new Promise ((resolve) => {
  GaaMetering.getLoginPromise().then(() => {
    alert("You may open your log in page");
    const userState = {
      id: "user123456789",
      registrationTimestamp: 1647311022,
      granted: false,
    };
    insertHighlightedJson("#output", {message:"User identified via Publisher sign in"}, "User with Publisher Login")
    resolve(userState);
  });
});

const publisherEntitlementPromise = new Promise ((resolve) => {
  const publisherEntitlement = {
    granted: false,
  };
  resolve(publisherEntitlement);
});

function getUserState() {
  return {};
};

const allowedReferrers = ["reader-revenue-demo.ue.r.appspot.com", "process.env.PROXY_URL"]

GaaMetering.init({
  googleApiClientId: "process.env.OAUTH_CLIENT_ID",
  allowedReferrers: allowedReferrers,
  userState: getUserState(),
  unlockArticle: unlockArticle,
  showPaywall: showPaywall,
  handleSwGEntitlement: handleSwGEntitlement,
  registerUserPromise: registerUserPromise,
  handleLoginPromise: handleLoginPromise,
  publisherEntitlementPromise: publisherEntitlementPromise,
});

document.querySelector("#redirect").onclick = redirect
document.querySelector("#revoke").onclick = revokeIDToken

