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
  let host = req.headers.host || req.hostname || req.host;
  const secure =
    req.secure ||
    req.connection.encrypted ||
    req.get('X-Forwarded-Proto') === 'https';
  if (
    secure ||
    host.indexOf('localhost') != -1 ||
    host === process.env.PROXY_URL
  ) {
    // Skip localhost or if already secure.
    // console.log("skipping as host is already secure")
    next();
    return;
  }
  // console.log("probably redirecting...")
  if (host.indexOf(':80') == host.length - 3) {
    host = host.substring(0, host.length - 3);
  }
  res.writeHead(301, {location: 'https://' + host + req.originalUrl});
  res.end();
};

export default proxy;
