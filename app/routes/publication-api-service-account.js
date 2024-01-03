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

/**
 * GET /:readerId
 * A sample route that accepts a readerId as a url parameter, and uses
 * a service account for querying the Publication API's 
 * entitlementsPlans endpoint without an accesstoken.
 */
router.get('/:readerId', async (req, res) => {
  const api = new PublicationApi;
  const client = api.init();

  console.log(client.publications.readers.entitlementsplans);

  const plans = await client.publications.readers.entitlementsplans.get({
    name:
        `publications/${process.env.PUBLICATION_ID}/readers/${req.params.readerId}/entitlementsplans`
  });

  res.json(plans.data);
});

export default router;