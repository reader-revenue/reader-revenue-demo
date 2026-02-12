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

import express from 'express';
import { GoogleAuth } from 'google-auth-library';

const router = express.Router();

const publicationId = process.env.PUBLICATION_ID || "CAowqfCKCw";
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "reader-revenue-demo";

const apiScopes = [
    'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.readonly',
];

const auth = new GoogleAuth({
    scopes: apiScopes,
    projectId: projectId,
});

async function getAccessToken() {
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    if (!accessTokenResponse || !accessTokenResponse.token) {
        throw new Error("Failed to retrieve token from accessTokenResponse");
    }
    return accessTokenResponse.token;
}

/**
 * GET /api/eafs/check-free-access
 * Calls the checkFreeAccess API for EAfS.
 */
router.get('/check-free-access', async (req, res) => {
  try {
    const { httpReferrer, contentUri } = req.query;

    if (!httpReferrer || !contentUri) {
      return res.status(400).json({ error: 'Missing httpReferrer or contentUri' });
    }

    const endpoint = `https://subscribewithgoogle.googleapis.com/v1/publications/${publicationId}:checkFreeAccess`;
    const queryParams = new URLSearchParams({
        http_referrer: httpReferrer,
        uri: contentUri
    });

    const url = `${endpoint}?${queryParams}`;

    const accessToken = await getAccessToken();

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    console.log({endpoint, queryParams, url, accessToken})


    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
         data = await response.json();
    } else {
         data = await response.text();
    }

    return res.status(response.status).json(data);

  } catch (e) {
    console.error('Error calling EAfS API:', e);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
