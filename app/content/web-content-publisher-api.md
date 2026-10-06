# Web Content Publisher API (Creator Publications)

Portal publications (such as `portal.reader-revenue-demo.dev`) can use the
**Web Content Publisher API** (`webcontentpublisher.googleapis.com/v1`) to
programmatically provision, list, and inspect **Creator** (Platform Participant)
publications within their Publisher Center organization.

!!! info **Portal Publication & Service Account Authentication**
In this demo environment, `portal.reader-revenue-demo.dev` (Publisher Center ID
`CAowrOThCw`) is configured as a Portal publication under Organization
`CCYwhJZT`.

The Web Content Publisher API uses server-to-server authentication with a
Google Cloud service account (`reader-revenue-demo@reader-revenue-demo.iam.gserviceaccount.com`
in project `695298810691` / `reader-revenue-demo`) granted **Organization Owner**
access in Publisher Center. When running locally with Application Default
Credentials (ADC), authenticate by impersonating the service account:

```bash
gcloud auth application-default login \
  --impersonate-service-account=reader-revenue-demo@reader-revenue-demo.iam.gserviceaccount.com \
  --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webcontentpublisher.publications.manage.system
```
!!!

## Server-side API call demo

### List Creator Publications in Organization {#listPublications}

Lists all publications under the Portal publication's organization
(`organizations/{organizationId}/publications`) and highlights the Creator
publications associated with the Portal. Click **Inspect Details** on any
Creator publication in the table to read its individual resource details below.

```javascript
const response = await client.organizations.publications.list({
  parent: `organizations/${organizationId}`,
});
```

### Create a Creator Publication {#createPublication}

Creates a new Creator publication under the Portal publication's organization
(`organizations/{organizationId}/publications`) with Subscription Linking
enabled (`slProduct.enabled = true`).

!!! hint **Primary Domain URL Format**
`primaryDomain.url` must be a valid `http://` or `https://` origin with no
trailing slash, URL path, query parameters, or fragments (for example,
`https://reader-revenue-demo.dev`).
!!!

```javascript
const response = await client.organizations.publications.create({
  parent: `organizations/${organizationId}`,
  requestBody: {
    displayName: 'Creator Publication',
    languageCode: 'en',
    regionCode: 'US',
    primaryDomain: {
      url: 'https://reader-revenue-demo.dev',
    },
    slProduct: {
      enabled: true,
      gcpProjectNumber: '695298810691',
    },
  },
});
```

### Read (Get) Creator Publication Details {#getPublication}

Fetches the full configuration and domain verification status for a specific
Creator (or Portal) publication (`organizations/{organizationId}/publications/{publicationId}`).

```javascript
const response = await client.organizations.publications.get({
  name: `organizations/${organizationId}/publications/${publicationId}`,
});
```

<br>

# Implementation Samples

## A custom client generated from the API discovery document

### Generate a client from the API discovery document

You can use the `google-api-nodejs-client` generator to build a standalone
client package from the Web Content Publisher API Discovery Document
(`https://webcontentpublisher.googleapis.com/$discovery/rest?version=v1`). Refer
to [how to generate a client from the API Discovery Document](https://developers.google.com/news/reader-revenue/monetization/reference/client-configuration#generate_a_client_from_the_api_discovery_document)
and [lib/client/README.md](https://github.com/reader-revenue/reader-revenue-demo/blob/main/lib/client/README.md)
for step-by-step instructions.

### Server-side code sample (Node.js)

```javascript
import webcontentpublisher from '@googleapis/webcontentpublisher';

/**
 * WebContentPublisher
 * A sample class that uses the generated @googleapis/webcontentpublisher
 * Node.js client and a service account for managing Creator publications.
 */
class WebContentPublisher {
  constructor() {
    this.auth = new webcontentpublisher.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/webcontentpublisher.publications.manage.system',
      ],
    });
  }

  init() {
    return new webcontentpublisher.webcontentpublisher({
      version: 'v1',
      auth: this.auth,
    });
  }
}

const api = new WebContentPublisher();
const client = api.init();

// 1. List publications in the Portal's organization
const listResponse = await client.organizations.publications.list({
  parent: `organizations/${organizationId}`,
});

// 2. Create a new Creator publication in the organization
const createResponse = await client.organizations.publications.create({
  parent: `organizations/${organizationId}`,
  requestBody: {
    displayName: 'Creator Publication',
    languageCode: 'en',
    regionCode: 'US',
    primaryDomain: {
      url: 'https://reader-revenue-demo.dev',
    },
    slProduct: {
      enabled: true,
      gcpProjectNumber: '695298810691',
    },
  },
});

// 3. Read (Get) the created Creator publication's details
const createdPubId = createResponse.data.publicationId;
const getResponse = await client.organizations.publications.get({
  name: `organizations/${organizationId}/publications/${createdPubId}`,
});
```
