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

import subscribewithgoogle from '@googleapis/subscribewithgoogle';
import express from 'express';

const router = express.Router();

/**
 * PublicationApi
 * A sample class that uses the GoogleApis node.js client and a service
 * account for interacting with the Publication API.
 */
class PublicationApi {
  constructor() {
    this.auth = new subscribewithgoogle.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.readonly'
      ],
    })
  }

  init() {
    return new subscribewithgoogle.subscribewithgoogle(
        {version: 'v1', auth: this.auth})
  }
}

const api = new PublicationApi;
const client = api.init();

/**
 * GET /entitlementsplans
 * A POST route that uses the reader_id from the body to query
 * the Monetization API's entitlementsPlans endpoint using a
 * service account instead of an access_token.
 */
router.post('/entitlementsplans', express.json(), async (req, res) => {
  const {reader_id} = req.body;

  const base = `publications/${process.env.PUBLICATION_ID}`;
  const endpoint = `readers/${reader_id}/entitlementsplans`;
  const name = `${base}/${endpoint}`;
  const plans = await client.publications.readers.entitlementsplans.get({name});

  return res.json(plans.data);
})

export default router;