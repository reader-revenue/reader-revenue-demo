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

/**
 * @param {object} [options={}] - An object containing configuration options for the input.
 * @param {string?} [options.placeHolder] - The text place holder to display for the input.
 * @param {string?} [options.id] - The ID attribute for the input.
 * @param {string[]?} [options.classNames] - An array of class names to add to the input.
 * @param {boolean?} [options.enable] - - If `false`, the input will be disabled (grayed out + readonly)
 * @param {function(Event)?: void} [options.callback] - A callback function to execute when the input value is changed.
 * The function receives the updated value t as its argument.
 * @returns {Element}
 */
function createInput(options = {}) {
  const input = document.createElement('input');
  Object.keys(options).forEach(key =>{
    switch(key){
      case 'initialValue':
        input.setAttribute('value', options[key]);
        break;
      case 'id':
        input.setAttribute('id', options[key]);
        break;
      case 'classNames':
        options[key].forEach((clazz) => input.classList.add(clazz));
        break;
      case 'placeHolder':
        input.setAttribute('placeholder', options[key]);
        break;
      case 'disable':
        input.disabled = options[key];
        break;
      case 'callback':
        input.onchange = (event) => options[key](event.target.value);
        break;
    } 
  });
  return input;
}

/**
 * create a header row element for a table
 * @param {string[]} headerTexts the number of the column depends on the array length
 * @returns {Element}
 */
function createHeaderRow(headerTexts){
  const headerRow = document.createElement('div');
  headerRow.setAttribute('class', 'header-row');
  headerTexts.forEach(headerText=>{
    const colHeader = document.createElement('div');
    colHeader.innerText = headerText;    
    headerRow.appendChild(colHeader);
  })
  return headerRow;
}

/**
 * @param {string} className
 * @param {Element[]} childElements
 * @returns {Element}
 */
function createRow(className, childElements){
  const row = document.createElement('div');
  if(className){
    row.classList.add(className);
  }
  childElements.forEach(element =>{
    row.appendChild(element); 
  })
  return row;
}

/**
 * @param {object} [options={}] - An object containing configuration options for the button.
 * @param {string?} [options.buttonText] - The text content to display inside the button.
 * @param {string?} [options.id] - The ID attribute for the button.
 * @param {string[]?} [options.classNames=[]] - An array of class names to add to the button.
 * @param {boolean?} [options.enable] - If `false`, the button will be disabled.
 * @param {function(Event)?: void} [options.callback] - A callback function to execute when the button is clicked.
 * The function receives the click `Event` object as its argument.
 * @returns {Element}
 */
function createButton(options={}){
  const button = document.createElement('button');
  Object.keys(options).forEach(key =>{
    switch(key){
      case 'buttonText':
        button.innerText = options[key];
        break;
      case 'id':
        button.setAttribute('id', options[key]);
        break;
      case 'classNames':
        options[key].forEach((clazz) => button.classList.add(clazz));
        break;
      case 'disable':
        button.disabled = options[key];
        break;
      case 'callback':
        button.onclick = (event) => options[key](event);
        break;
    }    
  });
  return button;
}

/**
 * @param {Element[]} childElements
 * @returns {Element}
 */
function createForm(childElements){
  const form = document.createElement('form');
  childElements.forEach(element =>{
    form.appendChild(element); 
  })
  return form;
}

export {
  generateHighlightedJson,
  insertHighlightedJson,
  parseJwt,
  parseJwtHeader,
  redirect,
  Loader,
  createInput,
  createHeaderRow,
  createRow,
  createButton,
  createForm
};
