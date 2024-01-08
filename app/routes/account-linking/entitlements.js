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

class Entitlements {
  constructor(accessToken = undefined, publicationId = process.env.PUBLICATION_ID) {
    this.publicationId = publicationId;
    this.accessToken = accessToken;
  }

  fetch() {

    //basic placeholder for all responses
    const productId = 'basic';

    try {

      console.log(`Returned ${this.publicationId}:${productId} for accessToken: ${this.accessToken}`)
      return {
        "source": this.publicationId,
        "products": [`${this.publicationId}:${productId}`],
        "subscriptionToken": "An opaque token that has meaning for publisher.",
        "detail" : `A ${productId} entitlement for the ${this.publicationId} publication, for accessToken ${this.accessToken}`
      };

    } catch (e) {

      console.log(`Failed to fetch entitlements for ${this.publicationId}:${productId}`)
    
    }
  }
}

export {Entitlements};