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
 * A class that exposes convenience functions for storing newsletter signups using the browser's localStorage as a cache. 
 * 
 * Note: In a production environment, a class like this could be used to 
 * store and retrieve access_tokens and state information from a database.
 * This example stores state only
 * in the browser's localStorage, which is temporary.
 */
class NewsletterPersistence {
    constructor() {
      this._signups = [];
    }
  
    set email(email) {
      this._signups.push(email);
      this.save();
    }
  
    get emails() {
      return this._signups;
    }
  
    refresh() {
      try {
        const {signups} = JSON.parse(localStorage.getItem("newsletterPersistence"));
        this._signups = signups;
      } catch (e) {
        console.log("Unable to restore signups from localStorage");
      }
    }
  
    save() {
      const {signups} = this;
      localStorage.setItem("newsletterPersistence", JSON.stringify({signups}));
    }
  
    reset() {
      localStorage.removeItem("newsletterPersistence");
    }
  }
  
  export {NewsletterPersistence};