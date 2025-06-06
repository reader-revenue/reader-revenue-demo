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
 * @fileoverview Class for use with managing and persisting newsletter signups in the browser's localStorage.
 */

/**
 * newsletterPersistence
 * A class that exposes convenience functions for storing CTA response data using the browser's localStorage as a cache.
 *
 * Note: In a production environment, a class like this could be used to
 * store and retrieve access_tokens and state information from a database.
 * This example stores state only in the browser's localStorage, which is temporary.
 */
class CtaPersistence {
  constructor() {
    this._ctaResponses = [];
    this.refresh();
  }

  //example: {TYPE_REWARDED_SURVEY, {..}}
  //For responseTypes, see https://github.com/subscriptions-project/swg-js/blob/8490f74371d18b78903d5f5a4dc07bbffb48e7b1/src/api/intervention-type.ts
  record(response, responseType) {
    this._ctaResponses.push({responseType, response});
    this.save();
  }

  get responses() {
    return this._ctaResponses;
  }

  getByType(responseType) {
    return this._ctaResponses.filter((ctaResponse)=>{ return ctaResponse.responseType === responseType})
  }

  refresh() {
    try {
      const {responses} = JSON.parse(
        localStorage.getItem('ctaResponses')
      );
      this._ctaResponses = responses;
    } catch (e) {
      console.log('Unable to restore responses from localStorage');
    }
  }

  save() {
    const responses = this._ctaResponses;
    localStorage.setItem('ctaResponses', JSON.stringify({responses}));
  }

  reset() {
    localStorage.removeItem('ctaResponses');
  }
}

export {CtaPersistence};
