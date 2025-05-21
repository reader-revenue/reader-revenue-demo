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
import { Entitlements } from './entitlements.js';
const router = express.Router();
router.get('/', async (req, res) => {
    /**
   * Fetch and return 'basic' entitlements
   * In a production environment, a publisher would fetch entitlements for
   * the access_token by quering their user/entitlements store and
   * returning the appropriate entitlements. In this example, a 'basic'
   * entitlement is returned for all access_tokens.
   */
    const entitlements = new Entitlements(req.query["access_token"]);
    return res.json(entitlements.fetch('basic'));
});
export default router;
//# sourceMappingURL=api.js.map