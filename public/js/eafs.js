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

import { insertHighlightedJson } from './utils.js';

async function checkFreeAccess() {
  const httpReferrer = document.getElementById('httpReferrer').value;
  const contentUri = document.getElementById('contentUri').value;
  const outputId = '#output';

  document.querySelector(outputId).innerHTML = 'Loading...';

  try {
    const queryParams = new URLSearchParams({
      httpReferrer,
      contentUri
    });

    const response = await fetch(`/api/eafs/check-free-access?${queryParams}`);
    const data = await response.json();

    insertHighlightedJson(outputId, data, 'API Response');
  } catch (e) {
    console.error(e);
    document.querySelector(outputId).innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const checkAccessBtn = document.getElementById('checkAccess');
  if (checkAccessBtn) {
    checkAccessBtn.onclick = checkFreeAccess;
  }
});
