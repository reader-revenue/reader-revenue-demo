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

/*
  Sample structure: 
  [
    {
      section: "Section label", //Label that appears for the section
      template: 'app/views/layouts/demo-layout.html' //handlebars template
      links: [
        {
          label: 'Test', //visible label
          url: '/', //url (relative to root)
          content: 'app/content/test.md' //.md or .html to render
          script: 'js/test.js' //relative to /public
        },
        {
          label: 'Home',
          url: '/home',
          content: 'app/content/home.md'
        }
      ]
    }
  ]
*/

const sections = [
  {
    links: [
      {
        label: 'Eng Demo',
        url: '/',
        content: 'app/content/demo.md',
        script: 'js/eng-demo.js',
      },
    ],
    template: 'app/views/layouts/demo-layout.html',
  },
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
    section: 'Subscribe with Google',
    links: [
      {
        label: 'Add swg.js',
        url: '/swg/add-swg-js',
        content: 'app/content/add-swg-js.md',
      },
      {
        label: 'Add Subscribe with Google button',
        url: '/swg/add-button',
        content: 'app/content/add-swg-button.md',
        script: 'js/add-swg-button.js',
      },
    ],
  },
  {
    section: 'Newsletter',
    links: [
      {
        label: 'Manual prompt invocation',
        url: '/newsletter/manual',
        content: 'app/content/newsletter-manual.md',
        options: {
          suppressStructuredDataMarkup: true,
          lang: 'fr',
        },
        script: 'js/newsletter-manual.js',
      },
      {
        label: 'Automatic prompt invocation',
        url: '/newsletter/automatic',
        content: 'app/content/newsletter-automatic.md',
        options: {
          suppressStructuredDataMarkup: true,
          lang: 'fr',
        },
        script: 'js/newsletter-automatic.js',
      },
    ],
    options: {
      // suppressInNav: true,
    },
  },
  {
    section: 'Using Extended Access',
    links: [
      {
        label: 'Registration Flow',
        url: '/extended-access/registration',
        content: 'app/content/extended-access-registration.md',
        script: 'js/extended-access.js',
      },
    ],
  },
  {
    section: 'Syncing Publisher Entitlements to Google',
    links: [
      {
        label: 'Subscription Linking - Client-side',
        url: '/subscription-linking/client-side',
        content: 'app/content/subscription-linking.md',
        script: 'js/subscription-linking.js',
      },
      {
        label: 'Account Linking - Client-side (deprecated)',
        url: '/account-linking/client-side',
        content: 'app/content/account-linking.md',
        script: 'js/account-linking.js',
      },
    ],
  },
  {
    section: 'Receiving Entitlements from Google',
    links: [
      {
        label: 'Publication API',
        url: '/reference/publication-api',
        content: 'app/content/publication-api.md',
        script: 'js/publication-api.js',
      },
      {
        label: 'Monetization API',
        url: '/reference/monetization-api',
        content: 'app/content/monetization-api.md',
        script: 'js/monetization-api.js',
      },
      {
        label: 'Pub/Sub - Handling messages',
        url: '/pub-sub/handling',
        content: 'app/content/pub-sub.md',
        script: 'js/pub-sub.js',
      },
    ],
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
      options: current?.options,
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

//These two functions exist because it is difficult in
// app/routes/documentation.js to understand which nav
// element is being called to key into the nav object
// so these search for the right value instead
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

export function options(req) {
  for (const current of sections) {
    for (const link of current.links) {
      if (req?.path === link.url) {
        return link.options ?? undefined;
      }
    }
  }
  return '';
}
