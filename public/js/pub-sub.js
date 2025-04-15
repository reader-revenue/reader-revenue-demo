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

  // loading icons
  const loaders = {
    v1: new Loader(document.getElementById('notificationsLog-v1')), 
    v2: new Loader(document.getElementById('notificationsLog-v2'))
  };
  loaders['v1'].start();
  loaders['v2'].start();
  
  // loop through each pubSubVersion
  pubSubVersions.forEach((pubSubVersion)=>{
    const startTime = Date.now();
    setInterval(async () => {
      //retrieve notifications for this version
      const notifications = await pollNotifications(pubSubVersion);
      if (notifications?.length > 0 && JSON.stringify(notifications) != currentNotifications) {
        console.log(`new pub/sub messages, re-displaying for pubSubVersion ${pubSubVersion}`);
        insertHighlightedJson(`#notificationsLog-${pubSubVersion}`, notifications, null, true);
        currentNotifications = JSON.stringify(notifications);
        // stop loading icon as now that there are notifications to show. 
        if(loaders[pubSubVersion].isStopped===false) loaders[pubSubVersion].stop(); 
      
      // if there's no content to show after 5 seconds has passed, stop the loading icon and show an empty array.  
      } else if(Date.now() - startTime >= 5000 && loaders[pubSubVersion].isStopped===false){
        insertHighlightedJson(`#notificationsLog-${pubSubVersion}`, [], null, true);
        loaders[pubSubVersion].stop();
      }
    }, 1000)
  })
}

document.addEventListener('DOMContentLoaded', async function() {
  await scheduleNotifications();
});
