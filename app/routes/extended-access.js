/**
 * Copyright 2024 Google LLC
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
import bodyParser from 'body-parser';

const router = express.Router();
/**
 * GET /api/extended-access/cookie/:cookieName
 * A getter method that returns the current httpOnly cookie.
 * This can be done client-side too, and is here for consistency.
 */
router.get('/cookie/:cookieName', async (req, res) =>{
  try {
    const cookie = req.cookies[req.params['cookieName']];
    return res.json({cookie});
  } catch (e) {
    console.log(e);
    return res.status(500).json({error:e});
  }
})

/**
 * POST /api/extended-access/cookie
 * Create an httpOnly cookie. Parses the POST body to set an
 * expiry date.
 */
router.post('/cookie', bodyParser.json(), async (req, res) =>{
  try {
    const { name, value, expiresInDays } = req.body;

    res.cookie(name, value, {
      expires: new Date(Date.now() + expiresInDays),
      httpOnly: true
    })

    res.send("Cookie set");

  } catch (e) {
    console.log(e);
    return res.status(500).end("Body unparseable");
  }
})

/**
 * GET /api/extended-access
 * In this example implementation, Extended Access does not require
 * and server-side api access, so this is intentionally left blank.
 * In a real world configuration, a publisher may use this either
 * for the server-side EA access flow, or as an aid to parts of the
 * entitlements handling or user registration completion.
 */
router.get('/', async (req, res, next) => {
  return res.end('Extended Access route loaded');
});



export default router;