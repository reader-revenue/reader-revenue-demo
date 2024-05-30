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

import {NewsletterPersistence} from './newsletter-persistence.js';
const newsletter = new NewsletterPersistence();

const urlParams = new URLSearchParams(window.location.search);
const specifiedConfigurationId =
  urlParams.get('configurationId') ?? '49c12712-9750-4571-8c67-96722561c13a';

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  subscriptions.configure({paySwgVersion: '2'});
  subscriptions.init('CAow3fzXCw');

  //TODO: Remove this next line after the following PR is merged:
  //https://github.com/subscriptions-project/swg-js/pull/3526
  //   subscriptions.getEntitlements();

  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);

  const availableInterventions =
    await subscriptions.getAvailableInterventions();

  console.log({allInterventions: availableInterventions});

  const specificPrompt = await getPrompt(
    availableInterventions,
    specifiedConfigurationId
  );

  console.log({specificPrompt});

  launchSpecificPrompt(specificPrompt);

  // const promptId = `<pre-defined id>`;
  // const button = document.querySelector('#prompt');

  // button.onclick = async () => {
  //     launchPrompt(promptId)
  // }
});

async function getPrompt(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

async function launchPrompt(promptId) {
  const prompt = await getPrompt(promptId);
  prompt?.show({
    isClosable: true,
    onResult: (result) => {
      newsletter.email = result;
      return true;
    },
  });
}

async function launchSpecificPrompt(specificPrompt) {
  specificPrompt?.show({
    isClosable: true,
    onResult: console.log,
  });
}
