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

/**
 * Parses prompt configurations from environment variables.
 *
 * This function attempts to retrieve and parse prompt configurations from the environment variables 
 * `PROMPT_CONFIG` or `PROMPT_CONFIG_BASE64`. The configurations are expected to be in JSON format.
 * If `PROMPT_CONFIG` is set, it's used directly. If not, `PROMPT_CONFIG_BASE64` is assumed to 
 * contain a base64-encoded JSON string, which is decoded before parsing.
 * 
 * Some systems cannot store stringified representations of a JSON object, so this function
 * allows for either a string or base64-encoded version to be used. For each, the schema expected is:
 * 
 * {
 *   "TYPE_<PROMPT_TYPE>": [
 *     {
 *       "name": <PROMPT_NAME>,
 *       "configurationId": <PROMPT_VALUE>
 *     }
 *   ]
 * }
 * 
 * Prompt configurations can have one or more top-level types, and one or more configurations
 * for each type.
 * 
 * @param {string} promptConfigurationType - The type of prompt configuration to retrieve from the parsed configurations.
 * @returns {Object|Array} The parsed prompt configurations for the specified type, or an empty array if no configurations are found or an error occurs.
 * @throws {Error} If there's an issue decoding the base64 string, parsing the JSON, or if no configurations are found for the specified type.
 */
function parsePromptConfigurations(promptConfigurationType) {

  try {

    let configurationString, configurations

    if('process.env.PROMPT_CONFIG' !== '') {
      console.log('loading from PROMPT_CONFIG')
      configurationString = 'process.env.PROMPT_CONFIG'
    } else {
      console.log('loading from PROMPT_CONFIG_BASE64')

      try {
        configurationString = atob('process.env.PROMPT_CONFIG_BASE64');
      } catch (e) {
        throw new Error(`Unable to base64 decode env var: ${e.message}`);
      }
    }
    try {
      configurations = JSON.parse(configurationString)[promptConfigurationType];
    } catch (e) {
      throw new Error(`Unable to JSON.parse configuration: ${e.message}`);
    }

    if (configurations != '') {
      return configurations
    }
    throw new Error("No PROMPT_CONFIGURATION set")
  } catch (e) {
    console.log(e.message)
    console.log(`No configuration set for: ${promptConfigurationType}`)
    console.log(`Env configuration: process.env.PROMPT_CONFIG_BASE64`)
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
