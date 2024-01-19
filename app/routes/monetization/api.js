/**
 * Copyright 2023-2024 Google LLC
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

import MonetizationApi from './client.js';
import express from 'express';

const router = express.Router();
const api = new MonetizationApi;
const client = api.init();
const base = `publications/${process.env.PUBLICATION_ID}`;

/**
 * GET /readers/:readerId
 * A GET route that uses the readerId to query
 * the Monetization API's readers endpoint using a
 * service account instead of an access_token.
 */
router.get('/readers/:readerId', express.json(), async (req, res) => {
  const {readerId} = req.params;

  const endpoint = `readers/${readerId}`;
  const name = `${base}/${endpoint}`;
  const response = await client.publications.readers.get({name});

  return res.json(response.data);
})

/**
 * GET /entitlementsplans
 * A POST route that uses the reader_id from the body to query
 * the Monetization API's entitlementsPlans endpoint using a
 * service account instead of an access_token.
 */
router.get('/readers/:readerId/entitlementsplans', express.json(), async (req, res) => {
  const {readerId} = req.params;

  const endpoint = `readers/${readerId}/entitlementsplans`;
  const name = `${base}/${endpoint}`;
  const response = await client.publications.readers.entitlementsplans.get({name});

  return res.json(response.data);
})

/**
 * GET /readers/:readerId/orders/:orderId
 * A GET route that uses the readerId and orderId to query
 * the Monetization API's orders endpoint using a
 * service account instead of an access_token.
 */
router.get('/readers/:readerId/orders/:orderId', express.json(), async (req, res) => {
  const {readerId, orderId} = req.params;

  const endpoint = `readers/${readerId}/orders/${orderId}`;
  const name = `${base}/${endpoint}`;
  const response = await client.publications.readers.orders.get({name});

  return res.json(response.data);
})

export default router;