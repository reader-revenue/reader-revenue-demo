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

import {NewsletterPersistence} from './newsletter-persistence.js';
const newsletterCache = new NewsletterPersistence();

async function registerEventManager(subscriptions) {
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);
}

async function getPrompt(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

async function launchSpecificPrompt(prompt) {
  prompt?.show({
    isClosable: true,
    onResult: (result) => {
      console.log(result);
      newsletterCache.signup(result);
    },
  });
}

async function createButtonForPrompt(
  availableInterventions,
  newsletterConfiguration,
  buttonEnabledState,
  container
) {
  const button = document.createElement('button');
  const prompt = await getPrompt(
    availableInterventions,
    newsletterConfiguration.configurationId
  );

  if (buttonEnabledState == true) {
    button.onclick = () => {
      launchSpecificPrompt(prompt);
    };
  } else {
    button.setAttribute('disabled', 'true');
  }

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${newsletterConfiguration.name}`;
  container.appendChild(button);
}

export {
  registerEventManager,
  getPrompt,
  launchSpecificPrompt,
  createButtonForPrompt,
  newsletterCache,
};
