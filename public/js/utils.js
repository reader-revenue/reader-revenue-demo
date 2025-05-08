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
 * @fileoverview A set of utility functions for use by client-side js functions.
 */

import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/es/highlight.min.js';

/**
 * generateHighlightedJson
 * @param {json} json
 * @return {{Object}}
 * Generates a formatted <pre><code>{}</code></pre> block using hljs
 */
function generateHighlightedJson(json) {
  const output = document.createElement('pre');
  const code = document.createElement('code');
  code.classList.add('hljs', 'language-json');

  const textString = JSON.stringify(json, null, 2);
  if(!textString) return;
  const formattedTextString = hljs.highlight(textString, {language: 'json'});
  const textNodeFromString = document
    .createRange()
    .createContextualFragment(formattedTextString.value);
  code.append(textNodeFromString);
  output.append(code);
  return output;
}

/**
 * insertHighlightedJson
 * @param {string} baseElementId
 * @param {string} json
 * @param {string=} label
 * @param {string=} insertedElementId
* @param {boolean=} asParent
 * @return {Element} the container <div> element that is appended or inserted (afterend)
*/
function insertHighlightedJson(id, json, label = undefined, insertedElementId = null, asParent = false) {
  const container = document.createElement('div');
  if(insertedElementId) {
    container.id=insertedElementId;
  }

  const formattedJson = generateHighlightedJson(json);
  if(!formattedJson) return;
  if (label) {
    const header = document.createElement('h3');
    header.innerHTML = label;
    container.appendChild(header);
  }
  container.appendChild(formattedJson);
  
  if(asParent===true){
    document.querySelector(id).appendChild(container);
  } else {
    document.querySelector(id).insertAdjacentElement('afterend', container);
  }
  return container;
}

/**
 * parseJwt
 * Parse a JWT
 * @param {string} token
 * @returns {string}
 */
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

/**
 * parseJwtHeader
 * Parse a JWT
 * @param {string} token
 * @returns {string}
 */
function parseJwtHeader(token) {
  const base64Url = token.split('.')[0];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

/**
 * Redirect
 * Redirects a request consistently
 * @param {string} from
 * @param {string=} to
 */
function redirect(from, to = undefined) {
  const REDIRECT =
    to === undefined ? `${location.origin}/reference/publication-api` : to;
  console.log(`Redirecting from ${from}`);
  window.location.replace(REDIRECT);
}

/**
 * loader
 * Creates an animated gif as a pretend loader
 */
class Loader {
  /**
   * @param {Element} outputElement - The DOM element to append the loader image to.
   * @param {number | null} timeoutMs=null - Auto-stop timeout in milliseconds. If null, no timeout.
   * @param {function | null} onTimeoutComplete=null - Callback function to execute *only* when the timeout stops the loader.
  */
  constructor(outputElement, timeoutMs=null, onTimeoutComplete = null) {
    if (!outputElement || !(outputElement instanceof Element)) {
      throw new Error('Loader requires a valid DOM Element for output.');
    }
    this.outputElement = outputElement;
    this.loader = document.createElement('img');
    this.loader.src = 'img/spinner.gif';
    this.isStopped = true;
    // timeout to stop the loader
    this.timeoutMs = timeoutMs;
    this.timeoutId;
    if (this.onTimeoutComplete && typeof this.onTimeoutComplete !== 'function') {
      throw new Error('Loader onTimeoutComplete option must be a function or null.');
    }
    this.onTimeoutComplete = onTimeoutComplete;
  }

  start() {
    this.outputElement.append(this.loader);
    this.isStopped = false;
    // set timeout if timeoutSeconds is provided
    if (!!this.timeoutMs && this.timeoutMs > 0) {
      this._setupTimeout();
    }
  }

  stop() {
    this.loader.remove();
    this.isStopped = true;
    // clear timeout if the loader is stopped manually
    this._clearTimeout();
  }

  _setupTimeout(){
    // Clear any previous timeout if there any
    this._clearTimeout();
    this.timeoutId = setTimeout(() => {
      if (!this.isStopped) {
        this.stop();
      }
      this._clearTimeout();
      if(this.onTimeoutComplete){
        this.onTimeoutComplete();
      }
    }, this.timeoutMs);
  }

  /**
   * Helper method to clear the timeout.
   * @private
   */
  _clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export {
  generateHighlightedJson,
  insertHighlightedJson,
  parseJwt,
  parseJwtHeader,
  redirect,
  Loader,
};
