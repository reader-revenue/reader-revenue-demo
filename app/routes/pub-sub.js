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

const storage = new Storage('pub-sub');
router.post('/receive', express.json(), async (req, res) => {
  // The message from the Pub/Sub notification is a unicode string encoded in base64.
  const message =
      Buffer.from(req.body.message.data, 'base64').toString('utf-8');
  // Add the message from the Pub/Sub notification to the datastore in the `message` index
  await storage.create('message', message);
  return res.status(200).end();
})

router.get('/received', async (req, res) => {
  // Read all messages stored in the `message` index
  const messages = await storage.read('message');
  return res.json(messages);
})

export default router;