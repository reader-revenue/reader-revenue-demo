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

//APIs for content sections
import accountLinkingApi from './app/routes/account-linking/api.js';
import extendedAccess from './app/routes/extended-access.js';
import monetizationApi from './app/routes/monetization/api.js';
import pubSub from './app/routes/pub-sub.js';
import publicationApi from './app/routes/publication-api.js';
import subscriptionLinkingApi from './app/routes/subscription-linking/api.js';
import validationApi from './app/routes/validation/validate-purchases.js';
import cancellationApi from './app/routes/cancellation/api.js';

// Proxy handles https and reverse proxy settings for running locally
import cookies from './middleware/cookies.js';
import overrides from './middleware/overrides.js';
import proxy from './middleware/proxy.js';
import ssl from './middleware/ssl.js';

// Static routers with some custom behavior
import {css, img, js} from './app/routes/static-handlers.js';

// Configure app globals
const app = express();
app.set('trust proxy', 'loopback');
app.use(proxy);
app.use(ssl);
app.use(overrides);
app.use(cookies);

// Mount content sections
app.use('/readme', readme);
app.use('/', readerRevenue);

// Mount APIs for content sections
app.use('/api/subscription-linking', subscriptionLinkingApi);
app.use('/api/publication', publicationApi);
app.use('/api/pub-sub', pubSub);
app.use('/api/account-linking', accountLinkingApi);
app.use('/api/extended-access', extendedAccess);
app.use('/api/monetization', monetizationApi);
app.use('/api/validate-purchases', validationApi);
app.use('/api/cancellation', cancellationApi);

// Mount custom static file handlers
app.use('/img', img);
app.use('/js', js);
app.use('/css', css);

// redirect from the old Subscription Linking page path to the new one
app.get('/subscription-linking/client-side', (req, res) => {
  res.redirect('/subscription-linking');
});

// Boot the server
console.log(
  `Booted at ${new Date().toUTCString()} at ${process.env.HOST}:${
    process.env.PORT
  }`
);
app.listen(process.env.PORT, process.env.HOST);
