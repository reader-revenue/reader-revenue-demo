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

import express from 'express';
import {Storage} from '../../lib/datastore.js';

const router = express.Router();

router.post('/receive', express.json(), async (req, res) => {
  // The message from the Pub/Sub notification is a unicode string encoded in base64.
  const message =
      Buffer.from(req.body.message.data, 'base64').toString('utf-8');
  // Parse the above string into an object, and destructure the id from it
  const { id } = JSON.parse(message);
  // If the id suffix is .v2, treat it as the new format
  const pubSubNameSpace = (id.substring(id.length -3) === '.v2') 
    ? 'pub-sub-v2' : 'pub-sub';
  // Instantiate the library with the determined version as the namespace
  const storage = new Storage(pubSubNameSpace);
  // Add the message from the Pub/Sub notification to the datastore in the `message` index
  await storage.create('message', message);
  return res.status(200).end();
})

router.get('/received/:pubSubVersion', async (req, res) => {
  const pubSubVersions = ['v1','v2']
  const { pubSubVersion } = req.params
  // throw away invalid request versions
  if (!pubSubVersions.includes(pubSubVersion)) {
    return res.error(`Invalid version: ${req.params.version}`)
  }
  // Instantiate the storage library with the valid version / namespace
  const pubSubNameSpace = pubSubVersion === 'v2' ? 'pub-sub-v2' : 'pub-sub';
  const storage = new Storage(pubSubNameSpace);
  // Read and return all messages stored in the `message` index
  const messages = await storage.read('message');
  return res.json(messages);
})

export default router;