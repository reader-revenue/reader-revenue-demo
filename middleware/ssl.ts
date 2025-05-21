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

/**
 * @fileoverview Description of this file.
 */

import redirectSSL from 'redirect-ssl';
import { RequestHandler } from 'express';

// Since @types/redirect-ssl is not available, we'll use `any` for redirectSSL itself.
// We can define the structure of the options object for clarity.
interface RedirectSSLOptions {
  enabled?: boolean;
  // Add other options here if known, e.g., from documentation
  // redirectPort?: number;
  // temporary?: boolean;
  // ignoreHosts?: string[];
  // ignoreUrl?: boolean | RegExp | string;
  // XForwardedProto?: boolean;
  // httpsPort?: number;
}

const options: RedirectSSLOptions = {
  enabled: process.env.NODE_ENV === 'production',
};

// Assuming redirectSSL.create returns an Express RequestHandler.
// If not, this type might need to be adjusted or set to `any`.
const sslRedirectMiddleware: RequestHandler = (redirectSSL as any).create(options);

export default sslRedirectMiddleware;
