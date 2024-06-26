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

import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';

const {verify} = jwt;

const router = express.Router();

router.post('/', bodyParser.json(), (req, res) => {
  console.log(req.body);
  try {
    const {signedEntitlements, certificate} = req.body;
    const validCert = certificate.replaceAll('\r', '\r\n');

    const output = verify(signedEntitlements, validCert, {
      ignoreExpiration: true,
    });
    res.json(output);
  } catch (e) {
    res.status(500).json({
      error: 'validation',
      message: 'unable to validate',
    });
  }
});

export default router;
