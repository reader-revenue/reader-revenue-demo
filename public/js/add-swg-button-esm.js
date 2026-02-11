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
 * @fileoverview Client-side javascript file that adds interactive SwG buttons to a page via ESM.
 */

import { subscriptions } from "process.env.SWG_JS_MJS_URL";

/**
 * analyticsEventLogger
 * @param {{Object}} subs
 */
function analyticsEventLogger(subs) {
    subs.getEventManager().then(manager => {
      manager.registerEventListener((event) => {
        console.log("New analytics event: ", event);
      });
    });
  }

// Wait for the runtime to be installed and ready
await subscriptions.ready();

const paySwgVersion = "process.env.PAY_SWG_VERSION" == "1" ? "1" : "2"

//Only if the above evaluates to "2" do we use subscriptions.configure()
if (paySwgVersion == "2") {
  subscriptions.configure({
    paySwgVersion,
  });
}
subscriptions.init("process.env.PUBLICATION_ID");

analyticsEventLogger(subscriptions);

// 3. Render the smart button onto the DOM element
let swgStdButton = document.getElementById("swg-standard-button");
if (swgStdButton) {
    subscriptions.attachButton(
        swgStdButton,
        // 4. Include options i.e. light styles or languages..
        {theme: "light", lang: "en"},
        // .. and onclick functions in the callback i.e.
        // showOffersor subscribe(SKU)
        function() {
          subscriptions.showOffers({isClosable: true});  // Show offers carousel
        });
}

let swgOfferButton = document.getElementById("swg-offer-button");
if (swgOfferButton) {
    subscriptions.attachButton(
        swgOfferButton,
        // 4. Include options i.e. light styles or languages..
        {theme: "light", lang: "en"},
        // .. and onclick functions in the callback i.e.
        // showOffersor subscribe(SKU)
        function() {
          subscriptions.subscribe("process.env.SWG_SKU");// Show offers carousel
        });
}

let swgSmartButton = document.getElementById("swg-smart-button");
if (swgSmartButton) {
    subscriptions.attachSmartButton(
        swgSmartButton,
        // 4. Include options i.e. light styles or languages..
        {theme: "light", lang: "en"},
        // .. and onclick functions in the callback i.e.
        // showOffersor subscribe(SKU)
        function() {
          subscriptions.showOffers({isClosable: true});  // Show offers carousel
        });
}

subscriptions.setOnPaymentResponse(async (paymentResponse) => {
  let response = await paymentResponse;
  console.log("paymentResponse :", response);
  // caching readerId for Cancellation API & Monetization API demos
  localStorage.setItem("readerId", response.entitlements.entitlements[0].readerId);
  await response.complete();
  console.log(
      "response and transaction is complete, launching entitlements flow");

  const entitlements = await subscriptions.getEntitlements();
  console.log("Entitlements from setOnPaymentsResponse", entitlements);
});

subscriptions.setOnEntitlementsResponse(async (entitlementsResponse) => {
  const entitlements = await entitlementsResponse;
  console.log("Entitlements from setOnEntitlementsResponse", entitlements);
});
