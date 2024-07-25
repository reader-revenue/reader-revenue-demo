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

import {PromptPersistence} from './prompt-persistence.js';
const promptCache = new PromptPersistence();

async function registerEventManager(subscriptions) {
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);
}

async function getPrompt(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

async function getPromptByType(availableInterventions, promptType) {
  return availableInterventions.find(({type}) => {
    return type === promptType;
  });
}

async function launchSpecificPrompt(prompt, promptType) {

  prompt?.show({
    isClosable: true,
    onResult: (response) => {
      console.log(response);
      promptCache.record(response, promptType)

      if (isGTAGEnabled()) {
        gtag('event', `${promptType}-response`, {
          'response': JSON.stringify(response)
        })
      }

      return true;
    },
  });
}

// A boolean function to handle the potential of surfacing
// .env vars to enable Google Analytics
function isGTAGEnabled() {
  let GTAG_PROPERTY_ID = 'process.env.GTAG_PROPERTY_ID'
  return GTAG_PROPERTY_ID != ''
}

async function createButtonForPrompt(
  availableInterventions,
  newsletterConfiguration,
  buttonEnabledState,
  container,
  promptType
) {
  const button = document.createElement('button');
  const prompt = await getPrompt(
    availableInterventions,
    newsletterConfiguration.configurationId
  );

  if (buttonEnabledState == true) {
    button.onclick = () => {
      launchSpecificPrompt(prompt, promptType);
    };
  } else {
    button.setAttribute('disabled', 'true');
  }

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${newsletterConfiguration.name}`;
  container.appendChild(button);
}

async function createButtonsForPrompts(
  buttonContainer,
  promptConfigurationType,
  promptConfigurations,
  availableInterventions
) {

  const availableInterventionConfigurationIds = availableInterventions.map(
    (intervention) => intervention.configurationId
  );

  for (const promptConfiguration of promptConfigurations) {
    const buttonEnabledState = availableInterventionConfigurationIds.includes(
      promptConfiguration.configurationId
    );

    createButtonForPrompt(
      availableInterventions,
      promptConfiguration,
      buttonEnabledState,
      buttonContainer,
      promptConfigurationType
    );
  }
}

function parsePromptConfigurations(promptConfigurationType) {
  try {
    const configurations = process.env.PROMPT_CONFIGURATIONS
    if (configurations != '') {
      return JSON.parse(configurations)[promptConfigurationType]
        .map((configuration)=>{
          configuration.name = configuration.name.replaceAll("_", " ");
          return configuration
        });
    }
    throw new Error("No PROMPT_CONFIGURATION set")
  } catch (e) {
    console.log(`No configuration set for: ${promptConfigurationType}`)
    console.log(`Env configuration: ${process.env.PROMPT_CONFIGURATIONS}`)
    console.log(`Parsed output:`, JSON.parse(process.env.PROMPT_CONFIGURATIONS))
    return []
  }
}

export {
  registerEventManager,
  getPrompt,
  launchSpecificPrompt,
  createButtonForPrompt,
  createButtonsForPrompts,
  parsePromptConfigurations,
  promptCache,
};
