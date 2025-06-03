/**
 * Copyright 2025 Google LLC
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

import CancellationApi from './client.js';
import express from 'express';

const router = express.Router();
const api = new CancellationApi;
const client = api.init();

/**
 * POST /publications/:publicationId/readers/:readerId/orders/:orderId:refund
 */
router.post('/publications/:publicationId/readers/:readerId/orders/:orderId/refund', express.json(), async (req, res) => {
  try {
    const {publicationId, readerId, orderId} = req.params;
    const name = `publications/${publicationId}/readers/${readerId}/orders/${orderId}`;
    const response = await client.publications.readers.orders.refund({name});
    return res.json(response.data);
  } catch (e) {
    console.error(e)
    return res.status(e.status).json({errors: e.errors});
  }
})

/**
 * POST /publications/:publicationId/readers/:readerId/entitlementsplans/cancel
 */
router.post('/publications/:publicationId/readers/:readerId/entitlementsplans/:entitlementsplans/cancel', express.json(), async (req, res) => {
  try {
    const {publicationId, readerId, entitlementsplans} = req.params;
    const name = `publications/${publicationId}/readers/${readerId}/entitlementsplans/${entitlementsplans}`;
    const response = await client.publications.readers.entitlementsplans.cancel(
      {
        name,
        cancelImmediately: req.body.cancel_immediately
      }
    );
    return res.json(response.data);
  } catch (e) {
    console.error(e)
    return res.status(e.status).json({errors: e.errors});
  }
})

export default router;
