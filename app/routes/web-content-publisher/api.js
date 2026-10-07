/**
 * Copyright 2026 Google LLC
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
 * @fileoverview Express routes for demonstrating the Web Content Publisher API
 * (organizations.publications.create, organizations.publications.list, and
 * organizations.publications.get).
 */

import cors from 'cors';
import express from 'express';

import {WebContentPublisher} from './client.js';
import {
  createOrganizationPublication,
  getOrganizationPublication,
  listOrganizationPublications,
} from './publications.js';
import {formatApiError} from './validators.js';

const api = new WebContentPublisher();
const client = api.init();

const router = express.Router();
router.use(cors());
router.use(express.json());

/**
 * GetPublication (Read endpoint)
 * GET /api/web-content-publisher/organizations/:organizationId/publications/:publicationId
 */
router.get(
  '/organizations/:organizationId/publications/:publicationId',
  async (req, res) => {
    try {
      const {organizationId, publicationId} = req.params;
      const result = await getOrganizationPublication(
        client,
        organizationId,
        publicationId
      );
      return res.json(result);
    } catch (e) {
      console.error('GetPublication error:', e);
      const {status, payload} = formatApiError(e);
      return res.status(status).json(payload);
    }
  }
);

/**
 * ListPublications (List endpoint)
 * GET /api/web-content-publisher/organizations/:organizationId/publications
 */
router.get('/organizations/:organizationId/publications', async (req, res) => {
  try {
    const {organizationId} = req.params;
    const result = await listOrganizationPublications(
      client,
      organizationId,
      req.query
    );
    return res.json(result);
  } catch (e) {
    console.error('ListPublications error:', e);
    const {status, payload} = formatApiError(e);
    return res.status(status).json(payload);
  }
});

/**
 * CreatePublication (Create endpoint)
 * POST /api/web-content-publisher/organizations/:organizationId/publications
 */
router.post('/organizations/:organizationId/publications', async (req, res) => {
  try {
    const {organizationId} = req.params;
    const result = await createOrganizationPublication(
      client,
      organizationId,
      req.body
    );
    if (result.validationError) {
      return res.status(400).json({error: result.validationError});
    }
    return res.json(result);
  } catch (e) {
    console.error('CreatePublication error:', e);
    const {status, payload} = formatApiError(e);
    return res.status(status).json(payload);
  }
});

export default router;
