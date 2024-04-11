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

import { NewsletterPersistence } from './newsletter-persistence.js';
const newsletter = new NewsletterPersistence();

(self.SWG = self.SWG || []).push( subscriptions => {
    subscriptions.configure({paySwgVersion: '2'});
    subscriptions.init('CAowqfCKCw');

    const promptId = `<pre-defined id>`;
    const button = document.querySelector('#prompt');

    button.onclick = async () => {
        launchPrompt(promptId)
    }
});

async function getPrompt(promptId) {
    const availableInterventions = await subscriptions.getAvailableInterventions();

    return availableInterventions.find(({id}) => {
        return id === `<pre-defined string>`;
    });
}

async function launchPrompt(promptId) {
    const prompt = await getPrompt(promptId);
    prompt?.show({
        isClosable: true,
        onResult: (result) => {
            newsletter.email = result;
            return true;
        }
    });
}