/**
 * Copyright 2024 Google LLC
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
 * @fileoverview This client-side js file is used to 
 * poll and display received notifications issued from
 * Cloud Pub/Sub, and stored in Cloud Datastore.
 */
import {insertHighlightedJson, Loader} from './utils.js';


async function pollNotifications() {
  return await fetch('/api/pub-sub/received').then(r => r.json());
}

function scheduleNotifications() {
  let currentNotifications = '';
  const output = '#notificationsLog';
  insertHighlightedJson(output, []);

  setInterval(async () => {
    const notifications = await pollNotifications();
    if (JSON.stringify(notifications) != currentNotifications) {
      console.log('new pub/sub messages, re-displaying');
      insertHighlightedJson(output, notifications);
      currentNotifications = JSON.stringify(notifications);
    }
  }, 1000)
}

document.addEventListener('DOMContentLoaded', async function() {
  await scheduleNotifications();
});
