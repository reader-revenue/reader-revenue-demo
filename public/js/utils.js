/**
 * @fileoverview Description of this file.
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
  const textNodeFromString = document.createRange().createContextualFragment(
      formattedTextString.value);
  code.append(textNodeFromString)
  output.append(code)
  return output;
}

/**
 * insertHighlightedJson
 * @param {string} id
 * @param {string} json
 * @param {string=} label
 */
function insertHighlightedJson(id, json, label = undefined) {
  const container = document.createElement('div');
  const formattedJson = generateHighlightedJson(json);
  if (label) {
    const header = document.createElement('h3');
    header.innerText = label;
    container.appendChild(header);
  }
  container.appendChild(formattedJson);
  document.querySelector(id).insertAdjacentElement('afterend', container);
}

/**
 * parseJwt
 * Parse a JWT
 * @param {string} token
 * @returns {string}
 */
function parseJwt(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(
      atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''));

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
  constructor(output) {
    this.output = output;
    this.loader = document.createElement('img');
    this.loader.src = 'img/spinner.gif';
  };

  start() {
    this.output.append(this.loader);
  }

  stop() {
    this.loader.remove();
  }
}

export {
  generateHighlightedJson,
  insertHighlightedJson,
  parseJwt,
  redirect,
  Loader
}