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

import {AnalyticsEventHandler} from './subscription-linking-event-handler.js';
import {createForm, createHeaderRow, createInput, createRow} from './utils.js';

function randomPpid() {
  return String(Math.floor(Math.random() * 1e6));
}

const DEFAULT_PUBLICATION_ID = 'process.env.PUBLICATION_ID';

const linkState = {
  publicationId: DEFAULT_PUBLICATION_ID,
  ppid: randomPpid(),
};

function renderJsonResult(outputContainer, payload) {
  while (outputContainer.firstChild) {
    outputContainer.removeChild(outputContainer.firstChild);
  }
  const code = document.createElement('code');
  code.classList.add('hljs', 'language-json');
  code.textContent = JSON.stringify(payload, null, 2);
  outputContainer.appendChild(code);
}

function triggerLinkSubscription(
  publicationId,
  ppid,
  eventHandler,
  outputContainer
) {
  const cleanPubId = publicationId.trim();
  const cleanPpid = ppid.trim();
  (self.SWG = self.SWG || []).push(async (subscriptions) => {
    try {
      const result =
        cleanPubId && cleanPubId !== DEFAULT_PUBLICATION_ID
          ? await subscriptions.linkSubscriptions({
              linkTo: [
                {
                  publicationId: cleanPubId,
                  publisherProvidedId: cleanPpid,
                },
              ],
            })
          : await subscriptions.linkSubscription({
              publisherProvidedId: cleanPpid,
            });
      eventHandler.logCallback(result);
      renderJsonResult(outputContainer, {
        status: 'completed',
        publicationId: cleanPubId,
        publisherProvidedId: cleanPpid,
        result,
      });
    } catch (e) {
      console.error(e);
      renderJsonResult(outputContainer, {
        status: 'error',
        message: e?.message || String(e),
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const eventHandler = new AnalyticsEventHandler();
  const output = document.createElement('pre');

  const inputPubId = createInput({
    initialValue: linkState.publicationId,
    id: 'link-btn-pubid-input',
    callback: (newValue) => {
      linkState.publicationId = newValue;
    },
  });

  const inputPpid = createInput({
    initialValue: linkState.ppid,
    id: 'link-btn-ppid-input',
    callback: (newValue) => {
      linkState.ppid = newValue;
    },
  });

  const headerRow = createHeaderRow(['PublicationID', 'PPID']);
  const row = createRow('input-row', [inputPubId, inputPpid]);
  const form = createForm([headerRow, row, output]);

  const anchor = document.querySelector('#linkConfig');
  if (anchor) {
    anchor.insertAdjacentElement('afterend', form);
  }

  const buttons = document.querySelectorAll(
    '.gsi-material-button:not(:disabled)'
  );
  for (const btn of buttons) {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      triggerLinkSubscription(
        linkState.publicationId,
        linkState.ppid,
        eventHandler,
        output
      );
    });
  }

  (self.SWG = self.SWG || []).push((subscriptions) => {
    subscriptions.getEventManager().then((manager) => {
      manager.registerEventListener((event) => {
        eventHandler.logEvent(event);
      });
    });
  });
});
