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

import {PubSub} from '@google-cloud/pubsub';
import express from 'express';

import {Storage} from '../../lib/datastore.js';

const router = express.Router();
const publicationId = process.env.PUBLICATION_ID;
const topic = '';


// // Creates a client; cache this for further use
// const pubSubClient = new PubSub();

// function listenForMessages(subscriptionNameOrId, timeout) {
//   // References an existing subscription
//   const subscription = pubSubClient.subscription(subscriptionNameOrId);

//   // Create an event handler to handle messages
//   let messageCount = 0;
//   const messageHandler = message => {
//     console.log(`Received message ${message.id}:`);
//     console.log(`\tData: ${message.data}`);
//     console.log(`\tAttributes: ${message.attributes}`);
//     messageCount += 1;

//     // "Ack" (acknowledge receipt of) the message
//     message.ack();
//   };

//   // Listen for new messages until timeout is hit
//   subscription.on('message', messageHandler);

//   // Wait a while for the subscription to run. (Part of the sample only.)
//   setTimeout(() => {
//     subscription.removeListener('message', messageHandler);
//     console.log(`${messageCount} message(s) received.`);
//   }, timeout * 1000);
// }

// listenForMessages();


router.get('/', (req, res) => {res.end('pub/sub is a-ok')})


const storage = new Storage('pub-sub');
router.post('/receive', express.json(), async (req, res) => {
  // The message is a unicode string encoded in base64.
  const message =
      Buffer.from(req.body.message.data, 'base64').toString('utf-8');
  await storage.create('message', message);
  return res.status(200).end();
})

router.get('/received', async (req, res) => {
  const messages = await storage.read('message');
  return res.json(messages);
})


export default router;