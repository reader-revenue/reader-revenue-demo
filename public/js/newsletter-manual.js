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
  createButtonsForPrompts,
  registerEventManager,
} from './prompt-methods.js';

const promptConfigurationType = 'TYPE_NEWSLETTER_SIGNUP'
const promptConfigurations = [
  {
    name: 'Nightly news',
    configurationId: 'cc1a94ee-614f-4946-a61e-0fea41683f4c',
  },
  {
    name: 'Confirmed nightly news',
    configurationId: '6f095914-fe2a-4721-8df5-e99fea544288',
  },
];

const buttonContainer = document.querySelector('#prompts');

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  subscriptions.configure({paySwgVersion: '2'});
  subscriptions.init('process.env.PUBLICATION_ID');

  await registerEventManager(subscriptions);
  const availableInterventions = await subscriptions.getAvailableInterventions();

  console.log({availableInterventions});

  await createButtonsForPrompts(
    buttonContainer, 
    promptConfigurationType, 
    promptConfigurations,
    availableInterventions)
  
});
