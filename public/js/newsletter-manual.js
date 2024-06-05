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

/**
 * @fileoverview This client-side js file to handle newsletter prompts
 */

import {
  createButtonForPrompt,
  registerEventManager,
} from './newsletter-methods.js';

const newsletterConfigurations = [
  {
    name: 'Subscriber Newsletter',
    configurationId: '49c12712-9750-4571-8c67-96722561c13a',
  },
  {
    name: 'Breaking News',
    configurationId: 'e98a2efb-d009-43c9-99ef-dda11c8c5a7f',
  },
];

const buttonContainer = document.querySelector('#newsletterPrompts');

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  subscriptions.configure({paySwgVersion: '2'});
  subscriptions.init('CAow3fzXCw');

  await registerEventManager(subscriptions);

  const availableInterventions =
    await subscriptions.getAvailableInterventions();

  // console.log({availableInterventions});

  const availableInterventionConfigurationIds = availableInterventions.map(
    (intervention) => intervention.configurationId
  );

  for (const newsletterConfiguration of newsletterConfigurations) {
    const buttonEnabledState = availableInterventionConfigurationIds.includes(
      newsletterConfiguration.configurationId
    );

    createButtonForPrompt(
      availableInterventions,
      newsletterConfiguration,
      buttonEnabledState,
      buttonContainer
    );
  }
});
