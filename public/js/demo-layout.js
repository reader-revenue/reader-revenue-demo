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
 * @fileoverview Description of this file.
 */
/**
 * toggleNav
 * A function that shows or hides the nav
 */
function toggleNav() {
  document.querySelector('.navbar-toggler').onclick = () => {
    document.querySelector('.developer-site-nav').classList.toggle('displayed');
  };
}
/**
 * addHeadingLinks
 * A function that adds visible # links to any content heading
 */
function addHeadingLinks() {
  const headings = document.querySelectorAll(`
    .devsite-content-details h1,
    .devsite-content-details h2,
    .devsite-content-details h3,
    .devsite-content-details h4,
    .devsite-content-details h5,
    .devsite-content-details h6
  `);

  const visibleStyle = `
      position: absolute;
      left: 0;
      top: .1rem;
      font-size: 1.5rem;
      display: block;
  `;
  const hiddenStyle = `display: none;`;
  const headingStyle = `
      position: relative;
      padding-left: 1rem;
      margin-left: -1rem;
  `;
  for (const heading of headings) {
    if (heading.getAttribute('id') == '') {
      continue;
    }

    heading.setAttribute('style', headingStyle);
    const anchor = `${window.location.pathname}#${heading.getAttribute('id')}`;
    const link = document.createElement('a');
    link.setAttribute('href', anchor);
    link.setAttribute('style', hiddenStyle);
    link.append(document.createTextNode('#'));

    heading.insertAdjacentElement('afterbegin', link);
    heading.addEventListener('mouseover', function () {
      link.setAttribute('style', visibleStyle);
    });
    heading.addEventListener('mouseout', function () {
      link.setAttribute('style', hiddenStyle);
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  toggleNav();
  addHeadingLinks();
});
