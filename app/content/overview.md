# Reader Revenue Demo app

### An application that illustrates client- and server-side API Reader Revenue

---

## Installation and usage

### Install

`npm install`

### Run

`npm run local`

!!! hint When running locally, this application uses an `.env` file.

Please see the
[section on working with this application](#working-with-this-application) for
more details.

!!!

### Deploy

To deploy this application to the beta appspot service:

```shell
gcloud app deploy beta.yaml
```

To deploy this application to the prod appspot service (with optional `--quiet`
flag to expedite the deploy):

```shell
gcloud app deploy app.yaml --quiet
```

## Working with this application

This application is designed to allow content edits to happen with ease, but
allow enough flexibility to accommodate significant deviations from the
templated methods.

### Sample Env File

```shell
# General node.js env vars
PORT=8080 #port to run on
NODE_ENV=development
ENV_NAME=local #Give your instance a distinct name that surfaces in the header

# Settings for configuring behind a reverse proxy
PROXY_URL=local.domain
HOST=0.0.0.0
DISABLE_SSL=true

# Settings for signed cookies
COOKIE_SECRET=secret

# GCP-specific env vars for external service communication
GOOGLE_CLOUD_REGION=us-east1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/application_default_credentials.json

# Publication configuration
PUBLICATION_ID=publisher-center-ppid.google.com
OAUTH_CLIENT_ID=abcd-1234.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=secret-abc-1234
GOOGLE_SITE_VERIFICATION=public-abc-1234
```

### Overview

This project is an `express`-based node.js application, designed to run locally
or in a cloud runtime like App Engine or Glitch. It aims to make authoring
technical content in `markdown` documents, while using the flexibility of
handlebars templates and partials to afford customization at the page level. As
it is a node.js app, apis can be hosted to be used within the documents'
examples.

#### High-level walkthrough

```bash
├── app         # Where articles are authored and where apis are hosted
├── docs        # Community guidelines
├── lib         # Shared libraries for use across many parts of the app
├── middleware  # Custom middleware for running the app in specific circumstances
├── public      # Public css and js
├── server.js   # The actual app
```

## Rendering

Page rendering is done in two phases:

1.  Articles are fetched (and optionally converted from `markdown` to `html`)
1.  `html` representations of articles are rendered as the body within a
    handlebars template

Articles are located in `/app/content`, and are rendered within templates found
in `/app/views`. Articles can be either `html` or `markdown`, both of which can
include arbitrary in-line `html`. The `markdown` renderer includes extensions
for callouts, code blocks and custom ids (for use with client-side js).

Additionally, articles can include custom client-side `javascript`, injected in
the head of the document as a deferred js module. For example, from
`/app/views/layouts/demo-layout.html`:

```html

\{{ #data.script }}

<script defer type="module" src="\{{ this }}"></script>

\{{ /data.script }}
```

Custom per-page `javascript` modules, and per-section page templates, are
specified in the nav for the section, e.g. `/lib/nav/documentation.js`. See
[Adding an article](#adding-an-article) for more information.

## Standard tasks

### Editing an article

Articles are found in the `/app/content/` folder, and can be `markdown` or
`html`. When running the server locally, articles can be previewed by reloading
the page without the need to restart the server, as the app renders the articles
from markdown on every pageload.

### Adding an article

To add a new article, the file must be created, added to the navigation and then
configured with the relevant information within the navigation. While developing
locally, each time a change is made to the navigation, the server must be
restarted.

#### Steps to add an article

1.  Add a `markdown` or `html` file to `app/content/`
1.  Add the configuration for the file to `lib/nav/documentation.js`:
1.  Restart your server

#### Navigation configuration for new articles

The navigation file (e.g. `/lib/navigation/documentation.js`) constains a json
object that roughly follows these rules (with in-line comments). All fields are
required unless specified:

```javascript
[
  {
    "section": "Section label", // Label that appears for the section
    "template": "app/views/layouts/demo-layout.html" // (optional) Handlebars template, defaults to demo-layout.html
    "options": { //Optional section-level options
      "suppressInNav": true //Hide this section from the nav, but preserve access directly
    },
    "links": [
      {
        "label": "Test", // Visible label
        "url": "/", // Url (relative to root)
        "content": "app/content/test.md" // .md or .html to render,
        "script": "js/script.js" // Optional, relative to the /public folder
        "options": { //Optional, passed directly to template rendering
          "suppressStructuredDataMarkup" : true, // suppressed the ld+json block rendering
          "suppressInNav": true, //Hide this route from this section, but preserve access
          "lang": "en" //Specify a specific <html lang=""> value for a route
        }
      }
      // Insert more links for this section
    ]
  }
  // Insert more sections for this navigation tree
]
```

!!! hint **NOTE** : if a template is not specified, the `demo-layout.html`
template is used. !!!

### Adding a new Section

Adding a new section follows the rules of adding a new file, at least insofar as
modifying the navigation and restarting the server are concerned. That being
said, each section can define its own handlebars template, which in turn can
require their own partials. Handlebars templates are located in
`/app/views/layouts/` and partials in `/app/views/partials`.

## Advanced tasks

### Adding an article with client-side javascript

#### Quick Walkthrough

1.  add `script` to nav `/lib/nav/documentation.js`
1.  create new client-side js module, e.g. `/public/js/add-swg-button.js`
1.  Use the [header id plugin](/examples#markdown-renderer-plugins) to create a
    specific `#id` to use within client-side javascript. (see
    /app/content/subscription-linking.md) (see
    /app/content/subscription-linking.md)

#### In more detail  {#example}

To add custom javascript to a page, and have it link to the markdown-rendered
DOM, an easy approach is to begin with a specified [header
id](/examples#markdown-renderer-plugins), and use that to key into the page
with.

This section uses the `{#example}` custom id, and has the `exampel.js` script
added to the `script` entry in the nav. As a result, there is a button under the
header that is clickable and fires a custom event.

#### `/lib/nav/documentation.js` entry

```javascript
{
  section: "Content examples",
  links: [
    {
      label: 'admonition callouts',
      url: '/examples',
      content: 'app/content/examples.md'
    },
    {
      label: 'How to edit this site',
      url: '/contributing',
      content: 'README.md',
      script: 'js/readme.js'
    }
  ]
}
```

#### `/public/js/readme.js` script

```javascript
function makeExampleButton() {

  const button = document.createElement('button');
  const label = document.createTextNode('Press me!');
  button.appendChild(label);
  button.addEventListener('click', (event)=>{
    alert("Nice job!");
  });

  document
      .querySelector('#example')
      .insertAdjacentElement('afterend', button);
}

document.addEventListener('DOMContentLoaded', function () {
  makeExampleButton();
});
```

### Creating a new back-end service for use with a client-side example

To create a new back-end service, a new route should be created for it, attached
at the appropriate path, and then used by client-side javascript.

#### Create a new api router

In this example, the router is located at `/app/routes/readme.js`

```javascript
import express from 'express';
const router = express.Router();

router.get('/', async (req, res, next) => {
  return res.end(`Random number: ${Math.round(Math.random()*1000)}`);
});

export default router;
```

#### Import and mount the router in `server.js`

```javascript
import readme from './app/routes/readme.js'
app.use('/readme', readme)
```

#### (optional) Call the api from `readme.js`

Create a new function in your previously existing client-side js.
In this example: `/public/js/readme.js`

```javascript

// New function to call the api
async function makeAPICall() {
  const host = location.host;
  const endpoint = `readme`;
  const url = `https://${host}/${endpoint}`;
  try {
    return await fetch(url).then(r=>r.text());
  } catch(e) {
    throw new Error(`Unable to fetch ${url}`);
  }
}

// Modified existing function to use the new function
function makeExampleButton() {

  const button = document.createElement('button');
  const label = document.createTextNode('Press me!');
  button.appendChild(label);
  button.addEventListener('click', async (event)=>{
    const message = await makeAPICall();
    alert(message);
  });

  document
      .querySelector('#example')
      .insertAdjacentElement('afterend', button);
}
```