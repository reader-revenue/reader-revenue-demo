/**
 * Copyright 2023 Google LLC
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

import {ctaCache, registerEventManager} from './cta-methods.js';

const configurationId = 'process.env.NEWSLETTER_CTA_CONFIGURATION_ID';

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  // Configure the events logger
  await registerEventManager(subscriptions);

  // Get all available interventions
  const availableInterventions =
    await subscriptions.getAvailableInterventions();
    
  console.log({availableInterventions});

  // Return the CTA, if available, for the current configurationId
  const cta = availableInterventions.find(({intervention}) => {
    return intervention.configurationId === configurationId;
  });

  console.log({cta});

  // Show the CTA, if available
  cta?.show({
    isClosable: true,
    onResult: (result) => {
      console.log(result);
      ctaCache.signup(result);

      // Acknowledge that the email has been handled by the publisher
      return true;
    },
  });
});
