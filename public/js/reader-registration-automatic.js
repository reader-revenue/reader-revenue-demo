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
 * @fileoverview This client-side js file to handle automatic Reader Registration CTAs
 */

import {
    registerEventManager,
    launchSpecificCta,
  } from './cta-methods.js';
  
  const ctaConfigurationType = 'TYPE_REGISTRATION_WALL';
  
  (self.SWG = self.SWG || []).push(async (subscriptions) => {
    subscriptions.configure({ paySwgVersion: '2' });
    subscriptions.init('process.env.PUBLICATION_ID');
  
    await registerEventManager(subscriptions);
  
    // Fetch the available interventions from the API
    const availableInterventions = await subscriptions.getAvailableInterventions();
  
    console.log({ availableInterventions });
  
    // Filter interventions by the current type
    const filteredInterventions = availableInterventions.filter(
        (intervention) => intervention.type === ctaConfigurationType
    );
  
    console.log(filteredInterventions);
  
    // Show the CTA automatically if found
    if (filteredInterventions.length > 0) {
        launchSpecificCta(filteredInterventions[0], ctaConfigurationType);
    }
  });
  
  const OAUTH_CLIENT_ID = 'process.env.OAUTH_CLIENT_ID';
  
  function handleCredentialResponse(response) {
    console.log('Google One Tap response:', response);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize GIS if available
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      console.log('Google Identity Services script loaded and available.');
      google.accounts.id.initialize({
        client_id: OAUTH_CLIENT_ID,
        callback: handleCredentialResponse,
        rrmInterop: true,
      });
      google.accounts.id.prompt();
    } else {
      console.log('Google Identity Services script not loaded or available yet.');
    }
  
    // Handle clear storage button
    const clearButton = document.getElementById('clear-storage');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    }
  });
