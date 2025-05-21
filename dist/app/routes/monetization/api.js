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
/**
 * GET /publications/:publicationId/readers/:readerId
 * A GET route that uses the readerId to query
 * the Monetization API's readers endpoint using a
 * service account instead of an access_token.
 */
router.get('/publications/:publicationId/readers/:readerId', express.json(), async (req, res) => {
    try {
        const { publicationId, readerId } = req.params;
        const name = `publications/${publicationId}/readers/${readerId}`;
        const response = await client.publications.readers.get({ name });
        return res.json(response.data);
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ errors: e.errors });
    }
});
/**
 * GET /publications/:publicationId/readers/:readerId/entitlementsplans
 * A GET route that uses the reader_id to query
 * the Monetization API's entitlementsPlans endpoint using a
 * service account instead of an access_token.
 */
router.get('/publications/:publicationId/readers/:readerId/entitlementsplans', express.json(), async (req, res) => {
    try {
        const { publicationId, readerId } = req.params;
        const name = `publications/${publicationId}/readers/${readerId}/entitlementsplans`;
        const response = await client.publications.readers.entitlementsplans.get({ name });
        return res.json(response.data);
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ errors: e.errors });
    }
});
/**
 * GET /publications/:publicationId/readers/:readerId/orders/:orderId
 * A GET route that uses the readerId and orderId to query
 * the Monetization API's orders endpoint using a
 * service account instead of an access_token.
 */
router.get('/publications/:publicationId/readers/:readerId/orders/:orderId', express.json(), async (req, res) => {
    try {
        const { publicationId, readerId, orderId } = req.params;
        const name = `publications/${publicationId}/readers/${readerId}/orders/${orderId}`;
        const response = await client.publications.readers.orders.get({ name });
        return res.json(response.data);
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ errors: e.errors });
    }
});
export default router;
//# sourceMappingURL=api.js.map