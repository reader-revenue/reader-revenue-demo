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

const router = express.Router();
const publicationId = process.env.PUBLICATION_ID;

router.post('/exchange', express.json(), async (req, res) => {
  const {code, redirect} = req.body;
  const base = 'https://oauth2.googleapis.com'
  const query_params = [
    `client_id=${process.env.OAUTH_CLIENT_ID}`,
    `client_secret=${process.env.OAUTH_CLIENT_SECRET}`,
    `code=${code}`,
    `redirect_uri=${redirect}`,
    `grant_type=authorization_code`
  ].join('&')

  const url = `${base}/token?${query_params}`
  const requestOptions = {
    method: 'POST',
    redirect: 'follow'
  };

  const response = await fetch(url, requestOptions)
                       .then(response => response.json())
                       .catch(error => console.log('error', error));
  return res.json(response);
});

router.post('/refresh', express.json(), async (req, res) => {
  const {refreshToken} = req.body;
  const base = 'https://oauth2.googleapis.com'
  const query_params = [
    `client_id=${process.env.OAUTH_CLIENT_ID}`,
    `client_secret=${process.env.OAUTH_CLIENT_SECRET}`,
    `refresh_token=${refreshToken}`, `grant_type=refresh_token`
  ].join('&')

  const url = `${base}/token?${query_params}`
  const requestOptions = {method: 'POST', redirect: 'follow'};

  const response = await fetch(url, requestOptions)
                       .then(response => response.json())
                       .catch(error => console.log('error', error));
  return res.json(response);
});

router.post('/entitlements', express.json(), async (req, res) => {
  const {accessToken} = req.body;
  const base = `https://subscribewithgoogle.googleapis.com/v1/publications`;
  const endpoint = 'entitlements';
  const params = `access_token=${accessToken}`;
  const url = `${base}/${publicationId}/${endpoint}?${params}`;
  const response = await fetch(url).then(r => r.json());
  try {
    // if ('entitlements' in response) {
    //   response.entitlements[0].userId = '4df0faf26630a56329a137ccbfc5d464'
    // }
  } catch (e) {
    console.log('no entitlements to mock a userId into')
  }
  return res.json(response);
})

router.post('/entitlementsplans', express.json(), async (req, res) => {
  const {accessToken, user_id} = req.body;
  const base = `https://subscribewithgoogle.googleapis.com/v1/publications`;
  const endpoint = `readers/${user_id}/entitlementsplans`;
  const params = `access_token=${accessToken}`;
  const url = `${base}/${publicationId}/${endpoint}?${params}`;
  console.log('entitlementsplans', url);
  const response = await fetch(url).then(r => r.json());
  return res.json(response);
})

export default router;