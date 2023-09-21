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

const sections = [
  {
    links: [
      {
        label: 'Overview',
        url: '/',
        content: 'app/content/overview.md',
        script: 'js/readme.js',
      },
    ],
    template: 'app/views/layouts/demo-layout.html',
  },
  {
    section: 'Content examples',
    links: [
      {
        label: 'How to edit this site',
        url: '/contributing',
        content: 'app/content/overview.md',
        script: 'js/readme.js',
      },
      {
        label: 'Markdown callout examples',
        url: '/examples',
        content: 'app/content/examples.md',
      },
    ],
  },
];

export function nav(req) {
  /*
        This function adds things to the nav:
        - adds an id
        - adds "active" if the currently loaded page is the same as the id
      */
  return sections.map((current) => {
    return {
      section: current.section || '',
      template: current.template || 'app/views/layouts/demo-layout.html',
      script: script(req),
      links: current.links.map((link) => {
        link.id = link.label
          .toLowerCase()
          .replace(/[^\w\s]/gi, '') // https://stackoverflow.com/a/4374890
          .replaceAll(' ', '-');
        link.current = req?.path === link.url ? 'current' : undefined;
        return link;
      }),
    };
  });
}

//this function is awful
//i am sorry
export function script(req) {
  for (const current of sections) {
    for (const link of current.links) {
      if (req?.path === link.url) {
        return link.script;
      }
    }
  }
  return '';
}
