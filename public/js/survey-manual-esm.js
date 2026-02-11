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
 * @fileoverview This client-side js file to handle survey CTAs via ESM
 */

import { subscriptions } from "process.env.SWG_JS_MJS_URL";
import {
  createButtonsForCtas,
  registerEventManager,
  parseCtaConfigurations,
} from "/js/cta-methods.js";

const ctaConfigurationType = "TYPE_REWARDED_SURVEY";
const ctaConfigurations = parseCtaConfigurations(ctaConfigurationType);

const buttonContainer = document.querySelector("#ctas");

// Wait for the runtime to be installed and ready
await subscriptions.ready();

subscriptions.configure({paySwgVersion: "2"});
subscriptions.init("process.env.PUBLICATION_ID");

await registerEventManager(subscriptions);
const availableInterventions = await subscriptions.getAvailableInterventions();

console.log({availableInterventions});

if (buttonContainer) {
  await createButtonsForCtas(
    buttonContainer, 
    ctaConfigurationType, 
    ctaConfigurations,
    availableInterventions)
}
