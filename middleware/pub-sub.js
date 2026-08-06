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

import {OAuth2Client} from 'google-auth-library';

const authClient = new OAuth2Client();

/**
 * Middleware to verify Google Cloud Pub/Sub push notification OIDC bearer tokens.
 * Validates that incoming push requests carry a genuine Google-signed JWT in the
 * Authorization: Bearer <token> header before allowing payloads to be persisted.
 */
export async function verifyPubSubToken(req, res, next) {
  // Allow bypassing verification strictly in local testing if explicitly configured
  if (process.env.SKIP_PUBSUB_AUTH === 'true') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .send('Unauthorized: Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).send('Unauthorized: Empty Bearer token');
  }

  try {
    const audience =
      process.env.PUBSUB_VERIFICATION_AUDIENCE || process.env.PUBSUB_AUDIENCE;
    const ticket = await authClient.verifyIdToken({
      idToken: token,
      audience: audience || undefined,
    });
    const payload = ticket.getPayload();

    // Verify token issuer is Google Accounts
    if (
      !payload ||
      (payload.iss !== 'accounts.google.com' &&
        payload.iss !== 'https://accounts.google.com')
    ) {
      return res.status(401).send('Unauthorized: Invalid token issuer');
    }

    req.pubsubTokenPayload = payload;
    next();
  } catch (err) {
    console.error('Pub/Sub token verification failed:', err.message);
    return res
      .status(401)
      .send(`Unauthorized: Token verification failed (${err.message})`);
  }
}

export default verifyPubSubToken;
