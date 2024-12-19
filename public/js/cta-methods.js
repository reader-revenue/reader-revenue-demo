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

import {CtaPersistence} from './cta-persistence.js';
const ctaCache = new ctaPersistence();

async function registerEventManager(subscriptions) {
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);
}

async function getcta(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

async function getctaByType(availableInterventions, ctaType) {
  return availableInterventions.find(({type}) => {
    return type === ctaType;
  });
}

async function launchSpecificcta(cta, ctaType) {

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

async function createButtonForcta(
  availableInterventions,
  newsletterConfiguration,
  buttonEnabledState,
  container,
  ctaType
) {
  const button = document.createElement('button');
  const cta = await getcta(
    availableInterventions,
    newsletterConfiguration.configurationId
  );

  if (buttonEnabledState == true) {
    button.onclick = () => {
      launchSpecificcta(cta, ctaType);
    };
  } else {
    button.setAttribute('disabled', 'true');
  }

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${newsletterConfiguration.name}`;
  container.appendChild(button);
}

async function createButtonsForctas(
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

    createButtonForcta(
      availableInterventions,
      ctaConfiguration,
      buttonEnabledState,
      buttonContainer,
      ctaConfigurationType
    );
  }
}

/**
 * Parses cta configurations from environment variables.
 *
 * This function attempts to retrieve and parse cta configurations from the environment variables 
 * `cta_CONFIG` or `cta_CONFIG_BASE64`. The configurations are expected to be in JSON format.
 * If `cta_CONFIG` is set, it's used directly. If not, `cta_CONFIG_BASE64` is assumed to 
 * contain a base64-encoded JSON string, which is decoded before parsing.
 * 
 * Some systems cannot store stringified representations of a JSON object, so this function
 * allows for either a string or base64-encoded version to be used. For each, the schema expected is:
 * 
 * {
 *   "TYPE_<cta_TYPE>": [
 *     {
 *       "name": <cta_NAME>,
 *       "configurationId": <cta_VALUE>
 *     }
 *   ]
 * }
 * 
 * cta configurations can have one or more top-level types, and one or more configurations
 * for each type.
 * 
 * @param {string} ctaConfigurationType - The type of cta configuration to retrieve from the parsed configurations.
 * @returns {Object|Array} The parsed cta configurations for the specified type, or an empty array if no configurations are found or an error occurs.
 * @throws {Error} If there's an issue decoding the base64 string, parsing the JSON, or if no configurations are found for the specified type.
 */
function parsectaConfigurations(ctaConfigurationType) {

  try {

    let configurationString, configurations
    
    /* 
    Because strings that begin with 'process' and 'env' are replaced in the 
    lib/renderers.js renderStaticFile() function, the second comparison
    has the string base64-encoded, so as to not be replaced at render time.
    This allows for the edge case wherein the process env string is not 
    replaced while rendering, and just exists as the string itself.
    */
    if('process.env.cta_CONFIG' !== '' && 'process.env.cta_CONFIG' !== atob('cHJvY2Vzcy5lbnYuUFJPTVBUX0NPTkZJRw')) {
      console.log('loading from cta_CONFIG')
      configurationString = 'process.env.cta_CONFIG'
    } else {
      console.log('loading from cta_CONFIG_BASE64')

      try {
        configurationString = atob('process.env.cta_CONFIG_BASE64');
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
    throw new Error("No cta_CONFIGURATION set")
  } catch (e) {
    console.log(e.message)
    console.log(`No configuration set for: ${ctaConfigurationType}`)
    console.log(`Env configuration: process.env.cta_CONFIG_BASE64`)
    return []
  }
}

export {
  registerEventManager,
  getcta,
  launchSpecificcta,
  createButtonForcta,
  createButtonsForctas,
  parsectaConfigurations,
  ctaCache,
};
