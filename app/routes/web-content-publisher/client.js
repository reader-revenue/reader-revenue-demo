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

import webcontentpublisher from '@googleapis/webcontentpublisher';

const WCP_SCOPE =
  'https://www.googleapis.com/auth/webcontentpublisher.publications.manage.system';

/**
 * WebContentPublisher
 * A sample class that uses the generated @googleapis/webcontentpublisher
 * Node.js client and a service account (via Application Default Credentials)
 * for interacting with the Web Content Publisher API.
 */
class WebContentPublisher {
  constructor() {
    this.auth = new webcontentpublisher.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [WCP_SCOPE],
    });
  }

  init() {
    return new webcontentpublisher.webcontentpublisher({
      version: 'v1',
      auth: this.auth,
    });
  }
}

export {WebContentPublisher, WCP_SCOPE};
export default WebContentPublisher;
