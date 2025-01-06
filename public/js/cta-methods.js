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

import { CtaPersistence } from './cta-persistence.js';
const ctaCache = new CtaPersistence();

async function registerEventManager(subscriptions) {
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);
}

async function getCta(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({ configurationId }) => {
    return configurationId === specifiedConfigurationId;
  });
}

async function getCtaByType(availableInterventions, ctaType) {
  return availableInterventions.find(({ type }) => {
    return type === ctaType;
  });
}

async function launchSpecificCta(cta, ctaType) {

  cta?.show({
    isClosable: true,
    onResult: (response) => {
      console.log(response);
      ctaCache.record(response, ctaType)

      if (isGTAGEnabled()) {
        gtag('event', `${ctaType}-response`, {
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

async function createButtonForCta(
  availableInterventions,
  newsletterConfiguration,
  buttonEnabledState,
  container,
  ctaType
) {
  const button = document.createElement('button');
  const cta = await getCta(
    availableInterventions,
    newsletterConfiguration.configurationId
  );

  if (buttonEnabledState == true) {
    button.onclick = () => {
      launchSpecificCta(cta, ctaType);
    };
  } else {
    button.setAttribute('disabled', 'true');
  }

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${newsletterConfiguration.name}`;
  container.appendChild(button);
}

/**
 * Generates the button text for a given intervention.
 *
 * @param {Object} intervention - The intervention object.
 * @param {number} index - The index of the intervention in the list.
 * @returns {string} The button text.
 */
function getButtonText(intervention, index) {
  // Transform intervention.type to a readable format
  const readableType = intervention.type
    .replace('TYPE_', '')
    .replace(/_/g, ' ');

  // Return intervention.name if it exists; otherwise, use readableType + index
  return intervention.name
    ? intervention.name
    : `${readableType} ${index + 1}`;
}

/**
 * Creates a single button for a dynamically fetched CTA.
 *
 * This method is used to create an individual button for a CTA based on
 * an intervention fetched from the API. It generates a button with a human-readable
 * label, attaches a click handler to launch the CTA, and appends it to the specified container.
 * 
 * It is designed for dynamically fetched CTAs and complements the 
 * `createButtonsForAvailableCtas` method, which handles multiple buttons.
 *
 * @param {Array<Object>} availableInterventions - Array of available interventions returned by the API.
 * @param {Object} intervention - The specific intervention object for which the button is being created.
 * @param {HTMLElement} container - The DOM element to which the button will be appended.
 * @param {number} index - The index of the intervention in the list, used for numbering the button text.
 * @returns {Promise<void>} Resolves when the button is created and appended to the container.
 */
async function createButtonForAvailableCta(
  availableInterventions,
  intervention,
  container,
  index
) {
  const button = document.createElement('button');
  const cta = await getCta(
    availableInterventions,
    intervention.configurationId
  );

  button.onclick = () => {
    launchSpecificCta(cta);
  };

  button.textContent = getButtonText(intervention, index);
  container.appendChild(button);
}

async function createButtonsForCtas(
  buttonContainer,
  ctaConfigurationType,
  ctaConfigurations,
  availableInterventions
) {

  const availableInterventionConfigurationIds = availableInterventions.map(
    (intervention) => intervention.configurationId
  );

  for (const ctaConfiguration of ctaConfigurations) {
    const buttonEnabledState = availableInterventionConfigurationIds.includes(
      ctaConfiguration.configurationId
    );

    createButtonForCta(
      availableInterventions,
      ctaConfiguration,
      buttonEnabledState,
      buttonContainer,
      ctaConfigurationType
    );
  }
}

/**
 * Creates buttons for CTAs dynamically based on available API interventions.
 *
 * This method generates buttons for a given type of CTA by filtering the 
 * API response (`availableInterventions`) and creating buttons with human-readable 
 * labels for each intervention. It is intended for CTAs that are dynamically 
 * fetched from the server, as opposed to hardcoded or static configurations.
 *
 * @param {HTMLElement} buttonContainer - The container element where buttons will be appended.
 * @param {Array<Object>} availableInterventions - Array of available interventions returned by the API.
 * @returns {Promise<void>} Resolves when buttons are created and added to the DOM.
 */
async function createButtonsForAvailableCtas(
  buttonContainer, filteredInterventions
) {
  for (let index = 0; index < filteredInterventions.length; index++) {
    const intervention = filteredInterventions[index];

    await createButtonForAvailableCta(
      filteredInterventions,
      intervention,
      buttonContainer,
      index
    );
  }
}

/**
 * Parses CTA configurations from environment variables.
 *
 * This function attempts to retrieve and parse CTA configurations from the environment variables 
 * `CTA_CONFIG` or `CTA_CONFIG_BASE64`. The configurations are expected to be in JSON format.
 * If `CTA_CONFIG` is set, it's used directly. If not, `CTA_CONFIG_BASE64` is assumed to 
 * contain a base64-encoded JSON string, which is decoded before parsing.
 * 
 * Some systems cannot store stringified representations of a JSON object, so this function
 * allows for either a string or base64-encoded version to be used. For each, the schema expected is:
 * 
 * {
 *   "TYPE_<CTA_TYPE>": [
 *     {
 *       "name": <CTA_NAME>,
 *       "configurationId": <CTA_VALUE>
 *     }
 *   ]
 * }
 * 
 * CTA configurations can have one or more top-level types, and one or more configurations
 * for each type.
 * 
 * @param {string} ctaConfigurationType - The type of CTA configuration to retrieve from the parsed configurations.
 * @returns {Object|Array} The parsed CTA configurations for the specified type, or an empty array if no configurations are found or an error occurs.
 * @throws {Error} If there's an issue decoding the base64 string, parsing the JSON, or if no configurations are found for the specified type.
 */
function parseCtaConfigurations(ctaConfigurationType) {
  console.log(ctaConfigurationType);
  try {

    let configurationString, configurations

    /* 
    Because strings that begin with 'process' and 'env' are replaced in the 
    lib/renderers.js renderStaticFile() function, the second comparison
    has the string base64-encoded, so as to not be replaced at render time.
    This allows for the edge case wherein the process env string is not 
    replaced while rendering, and just exists as the string itself.
    */
    if ('process.env.CTA_CONFIG' !== '' && 'process.env.CTA_CONFIG' !== atob('cHJvY2Vzcy5lbnYuQ1RBX0NPTkZJRw==')) {
      console.log('loading from CTA_CONFIG')
      configurationString = 'process.env.CTA_CONFIG'
    } else {
      console.log('loading from CTA_CONFIG_BASE64')

      try {
        configurationString = atob('process.env.CTA_CONFIG_BASE64');
      } catch (e) {
        throw new Error(`Unable to base64 decode env var: ${e.message}`);
      }
    }
    try {
      configurations = JSON.parse(configurationString)[ctaConfigurationType];
    } catch (e) {
      throw new Error(`Unable to JSON.parse configuration: ${e.message}`);
    }

    if (configurations != '') {
      return configurations
    }
    throw new Error("No CTA_CONFIGURATION set")
  } catch (e) {
    console.log(e.message)
    console.log(`No configuration set for: ${ctaConfigurationType}`)
    console.log(`Env configuration: process.env.CTA_CONFIG_BASE64`)
    return []
  }
}

export {
  registerEventManager,
  getCta,
  launchSpecificCta,
  createButtonForCta,
  createButtonForAvailableCta,
  createButtonsForCtas,
  createButtonsForAvailableCtas,
  parseCtaConfigurations,
  ctaCache,
};
