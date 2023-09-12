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

import readerRevenue from './app/routes/documentation.js';
import readme from './app/routes/readme.js';

// Proxy handles https and reverse proxy settings for running locally
import proxy from './middleware/proxy.js';
import ssl from './middleware/ssl.js';

// Configure app globals
const app = express();
app.set('trust proxy', 'loopback');
app.use(proxy);
app.use(ssl);

app.use('/readme', readme);
app.use('/', readerRevenue);
// Boot the server
console.log(
  `Booted at ${new Date().toUTCString()} at ${process.env.HOST}:${
    process.env.PORT
  }`
);
app.listen(process.env.PORT, process.env.HOST);
