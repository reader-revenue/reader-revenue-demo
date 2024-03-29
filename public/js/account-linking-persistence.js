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
 * @fileoverview Class for use with managing and persisting account linking
 * state in the browser's localStorage. 
 */


/**
 * accountLinkingPersistence
 * A class that exposes convenience functions for managing account linking
 * state, using the browser's localStorage as a cache. 
 * 
 * Note: In a production environment, a class like this could be used to 
 * store and retrieve access_tokens and state information from a database.
 * This example class mocks access_token generation, and stores state only
 * in the browser's localStorage, which is temporary.
 */
class accountLinkingPersistence {
  constructor() {
    this._linked = false;
    this._declined = false;
    this.accessToken = undefined;
    this.refresh();
    this.generateAccessToken();
  }

  set linked(isLinked) {
    this._linked = isLinked;
    this.save()
  }

  get linked() {
    return this._linked;
  }

  set declined(isDeclined) {
    this._declined = isDeclined;
    this.save();
  }

  get declined() {
    return this._declined;
  }

  get state() {
    return {
      linked: this._linked,
      declined: this._declined,
      accessToken: this.accessToken
    }
  }

  generateAccessToken(ppid = undefined) {
    if(this.accessToken !== undefined) return;

    this.accessToken = `entitlements_access_token_${ppid ? ppid : Math.round(Math.random()*1000)}`;
    this.save();
  }

  refresh() {
    try {
      const {linked, declined, accessToken} = JSON.parse(localStorage.getItem("accountLinkingPersistence"));
      this._linked = linked;
      this._declined = declined;
      this.accessToken = accessToken;
    } catch (e) {
      console.log("Unable to restore state from localStorage");
    }
  }

  save() {
    const {linked, declined, accessToken} = this;
    localStorage.setItem("accountLinkingPersistence", JSON.stringify({linked, declined, accessToken}));
  }

  reset() {
    localStorage.removeItem("accountLinkingPersistence");
  }
}

export {accountLinkingPersistence};