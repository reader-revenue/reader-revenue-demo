/**
 * Copyright 2025 Google LLC
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

import subscribewithgoogle from '@googleapis/subscribewithgoogle';

/**
 * CancellationApi
 */
class CancellationApi {
  constructor() {
    this.auth = new subscribewithgoogle.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.readonly',
        'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.manage'
      ],
    })
  }

  init() {
    return new subscribewithgoogle.subscribewithgoogle(
        {version: 'v1', auth: this.auth})
  }
}

export default CancellationApi;