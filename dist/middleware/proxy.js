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
const proxy = (req, res, next) => {
    // Determine host safely, prioritizing req.hostname
    let host = req.hostname || req.headers.host;
    // If host is still undefined, or if it's an IP address (which might be the case for req.host sometimes),
    // it might be best to not redirect or handle based on specific deployment strategy.
    // For this middleware's original intent, we proceed if host is found.
    if (!host) {
        // If host cannot be determined, proceed without redirecting.
        // Alternatively, could throw an error or handle differently.
        next();
        return;
    }
    const isSecure = req.secure || req.get('X-Forwarded-Proto') === 'https';
    if (isSecure ||
        host.includes('localhost') || // More robust check for localhost
        host === process.env.PROXY_URL) {
        next();
        return;
    }
    // Remove :80 if present, as redirect will be to https (port 443)
    if (host.endsWith(':80')) {
        host = host.substring(0, host.length - 3);
    }
    const redirectUrl = `https://${host}${req.originalUrl}`;
    res.writeHead(301, { Location: redirectUrl }); // 'Location' should be capitalized
    res.end();
};
export default proxy;
//# sourceMappingURL=proxy.js.map