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

async function pollNotifications(pubSubVersion) {
  return await fetch(`/api/pub-sub/received/${pubSubVersion}`)
    .then(
      r => r.json()
    ).catch(
      e => console.log(e));
}

function scheduleNotifications() {
  const pubSubVersions = ['v1','v2'];
  let currentNotifications = '';

  // loop through each pubSubVersion
  pubSubVersions.forEach((pubSubVersion)=>{
    let emptyOutputPlaceHolder = null; 
    const loader = new Loader(
      document.getElementById(`notificationsLog-${pubSubVersion}`), 
      // timeout to loading in 5 seconds
      5000,
      // callback onTimeout:  inserting an empty array [] as output
      () => { 
        emptyOutputPlaceHolder = insertHighlightedJson(`#notificationsLog-${pubSubVersion}`, [], null, null, true);
      }
    );
    loader.start();

    // periodically poll for notifications and update the UI if new Pub/Sub notitifications are detected.
    setInterval(async () => {
      // poll the backend for notifications for the current pubSubVersion.
      const notifications = await pollNotifications(pubSubVersion);
      // check if notifications were received AND if they differ from the cached version.
      if (notifications?.length > 0 && JSON.stringify(notifications) != currentNotifications) {
        console.log(`new pub/sub messages, re-displaying for pubSubVersion ${pubSubVersion}`);
        // remove the placeholder output ([]) if it's already added  
        // emptyOutputPlaceHolder is non null if the loader's onTimeout callback is alraedy executed 
        if(emptyOutputPlaceHolder){
          emptyOutputPlaceHolder.remove();
          emptyOutputPlaceHolder = null;
        }
        // display the new Pub/Sub notifications using syntax highlighting
        insertHighlightedJson(`#notificationsLog-${pubSubVersion}`, notifications, null, null, true);
        // cache the current notifications to check and compare in the next interval
        currentNotifications = JSON.stringify(notifications);
        // stop the loading indicator now that content is displayed.
        if(loader.isStopped===false) {
          loader.stop();
        }
      } 
    }, 1000)
  })
}

document.addEventListener('DOMContentLoaded', async function() {
  await scheduleNotifications();
});
