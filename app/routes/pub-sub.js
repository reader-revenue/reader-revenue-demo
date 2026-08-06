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

import {Storage} from '../../lib/datastore.js';
import {verifyPubSubToken} from '../../middleware/pub-sub.js';
import express from 'express';

const router = express.Router();

/**
 * Instantiate the storage library with the namespace
 * @param {string} namespace
 * @return {Storage}
 */
function getStorage(namespace) {
  const storage = new Storage(namespace);
  return storage;
}

router.post('/receive', express.json(), verifyPubSubToken, async (req, res) => {
  if (!req.body?.message?.data) {
    return res.status(400).send('Bad Request: Missing Pub/Sub message data');
  }

  // The message from the Pub/Sub notification is a unicode string encoded in base64.
  const message = Buffer.from(req.body.message.data, 'base64').toString(
    'utf-8'
  );
  const storage = getStorage('pub-sub');
  // Add the message from the Pub/Sub notification to the datastore in the `message` index
  await storage.create('message', message);
  return res.status(200).end();
});

router.get('/received', async (req, res) => {
  const storage = getStorage('pub-sub');
  // Read and return all messages stored in the `message` index
  const messages = await storage.read('message');
  // Filtering notifications
  const notifications = messages.filter((notification) => {
    try {
      const json = JSON.parse(notification.data);
      // Keep the notification if it has an ID AND is not a test message
      return (
        // Filter out if id doesn't exist (= not a valid Pub/Sub message)
        json.id &&
        // Filter out if it is for the Subscription Linking automated webdriver tests,
        !(
          json.eventObjectType === 'SUBSCRIPTION_LINKING' &&
          json.reader?.ppid?.startsWith('integration-test-')
        )
      );
    } catch (e) {
      // If JSON.parse fails, data is invalid as a Pub/Sub notification. Filter it out.
      return false;
    }
  });
  // Check if the notification volume has been increased from the previous call
  // The number of notifications that previously retrieved are passed as a query param from the client-side
  if (
    notifications.length === 0 ||
    notifications.length === req.query.previousMessageVolume
  ) {
    return res.json([]);
  }
  console.log(`new pub/sub messages received.`);
  return res.json(notifications);
});

export default router;
