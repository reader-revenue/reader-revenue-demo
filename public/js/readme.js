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
 * @fileoverview A sample client-side file for illustrating how to add features to this app.
 */

/**
 * makeExampleButton()
 * Add an example button
 */
function makeExampleButton() {
  const button = document.createElement('button');
  const label = document.createTextNode('Press me!');
  button.appendChild(label);
  button.addEventListener('click', async () => {
    const message = await makeAPICall();
    // eslint-disable-next-line no-alert
    alert(message);
  });

  document.querySelector('#example').insertAdjacentElement('afterend', button);
}

/**
 * makeAPICall()
 * @returns {{message: string}} The message.
 * Query a message to alert with
 */
async function makeAPICall() {
  const host = location.host;
  const endpoint = `readme`;
  const url = `https://${host}/${endpoint}`;
  try {
    return await fetch(url).then((r) => r.text());
  } catch (e) {
    throw new Error(`Unable to fetch ${url}`);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  makeExampleButton();
});
