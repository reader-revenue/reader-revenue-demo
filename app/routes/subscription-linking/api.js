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
 * @fileoverview The api for supporting Subscription Linking.
 */


import cors from 'cors';
import express from 'express';

import {Storage} from '../../../lib/datastore.js';

import {SubscriptionLinking} from './client.js';
import {basicEntitlement} from './entitlements.js';

const api = new SubscriptionLinking()
const client = api.init()

const router = express.Router()
const storage = new Storage('subscription-linking');
router.use(cors())

// GetReader
router.get('/readers/:ppid', async (req, res, next) => {
  try {
    const publicationId = process.env.PUBLICATION_ID;
    const ppid = req.params.ppid

    const reader = await client.publications.readers.get({
      name: `publications/${publicationId}/readers/${ppid}`,
    });

    return res.json({data: reader.data});
  } catch (e) {
    console.log(e)
    return res.status(500).json({error: e.message})
  }
});

router.get('/readers/:ppid/entitlements', async (req, res, next) => {
  try {
    const publicationId = process.env.PUBLICATION_ID;
    const ppid = req.params.ppid

    const reader = await client.publications.readers.get({
      name: `publications/${publicationId}/readers/${ppid}/entitlements`,
    });

    return res.json({data: reader.data});
  } catch (e) {
    console.log(e)
    return res.status(500).json({error: e.message})
  }
});

router.put('/readers/:ppid/entitlements', async (req, res, next) => {
  try {
    const publicationId = process.env.PUBLICATION_ID
    const ppid = req.params.ppid

    const requestBody = basicEntitlement()

    const update = await client.publications.readers.updateEntitlements({
      name: `publications/${publicationId}/readers/${ppid}/entitlements`,
      requestBody
    });

    return res.json({update});
  } catch (e) {
    next(e)
  }
})

router.get('/get/ppid/:ppid', async (req, res) => {
  try {
    const results = await storage.readByDataKeyValue('ppid', req.params.ppid);
    return res.json(results);
  } catch (e) {
    console.log(e)
  }

  return res.end('fetch failed')
})

router.get('/get/:type', async (req, res) => { 
  try {
    const results = await storage.read(req.params.type);
    return res.json(results);
  } catch (e) {
    console.log(e)
  }

  return res.end('fetch failed')
})


router.get('/get', async (req, res) => {
  try {
    const results = await storage.read();
    return res.json(results);
  } catch (e) {
    console.log(e)
  }

  return res.end('fetch failed')
})

/**
 * create
 * sample endpoint to create an entry with a random ppid
 * NOTE: keys within payload are spread, and become columns within datastore
 */
router.get('/create', async (req, res) => {
  const payload = {ppid: Math.round(Math.random() * 1000)};
  const response = await storage.create('ppid', payload);
  return res.json(response);
})

/**
 * log
 * sample endpoint that creates log entries
 * NOTE: value is stored as an object within datastore under the key 'value'
 */
router.get('/log', async (req, res) => {
  // Prepares the new entity
  const entry = {
    name: 'test',
    value: {randomNumber: Math.round(Math.random() * 10000)}
  };
  const response = await storage.create('log', entry);
  return res.json(response);
})


export default router