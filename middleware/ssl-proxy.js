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

import {SslStreamProxy} from '../lib/ssl-proxy/ssl-stream-proxy.js';

let proxyInstance = null;

/**
 * Retrieves or initializes the singleton SslStreamProxy instance.
 * Automatically starts the proxy server if SSL_PROXY_ENABLED is set to 'true'.
 *
 * @param {import('../lib/ssl-proxy/ssl-stream-proxy.js').SslStreamProxyOptions} [options] - Optional proxy configuration.
 * @return {SslStreamProxy} The singleton SslStreamProxy instance.
 */
export function getSslProxyInstance(options) {
  if (!proxyInstance) {
    proxyInstance = new SslStreamProxy(options);
    if (process.env.SSL_PROXY_ENABLED === 'true') {
      proxyInstance.start();
    }
  }
  return proxyInstance;
}

if (process.env.SSL_PROXY_ENABLED === 'true') {
  getSslProxyInstance();
}

/**
 * Express middleware that ensures requests routed via the local SSL proxy or matching
 * the configured target domain are marked with x-forwarded-proto: https.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const sslProxy = (req, res, next) => {
  if (
    req.headers['x-forwarded-proto'] === 'https' ||
    (req.headers.host &&
      proxyInstance &&
      proxyInstance.isTargetDomain(req.headers.host))
  ) {
    req.headers['x-forwarded-proto'] = 'https';
  }

  next();
};

export default sslProxy;
