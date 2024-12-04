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
 * @fileoverview This client-side js file to handle rewarded ads prompts
 */

import {
    createButtonsForAvailablePrompts,
    registerEventManager,
} from './prompt-methods.js';


const promptConfigurationType = 'TYPE_REWARDED_AD';

const buttonContainer = document.querySelector('#prompts');

(self.SWG = self.SWG || []).push(async (subscriptions) => {
    subscriptions.configure({ paySwgVersion: '2' });
    subscriptions.init('process.env.PUBLICATION_ID');

    await registerEventManager(subscriptions);

    // Fetch the available interventions from the API
    const availableInterventions = await subscriptions.getAvailableInterventions();

    console.log({ availableInterventions });

    // Filter interventions by the current type
    const filteredInterventions = availableInterventions.filter(
        (intervention) => intervention.type === promptConfigurationType
    );

    console.log(filteredInterventions);

    // Create buttons for the filtered interventions
    await createButtonsForAvailablePrompts(buttonContainer, filteredInterventions);
});
