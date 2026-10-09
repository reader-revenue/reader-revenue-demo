# Manage Creator Publications with the Web Content Publisher API

Portal publications can use the **Web Content Publisher API**
(`webcontentpublisher.googleapis.com/v1`) to programmatically provision, list,
and inspect **Creator** (Platform Participant) publications within their
Publisher Center organization.

!!! info **Portal Publication & Service Account Authentication**
The Web Content Publisher API uses server-to-server authentication with a
Google Cloud service account granted **Organization Owner** access in Publisher
Center. When running locally with Application Default Credentials (ADC),
authenticate by impersonating the service account:

```bash
gcloud auth application-default login \
  --impersonate-service-account=SERVICE_ACCOUNT_EMAIL \
  --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webcontentpublisher.publications.manage.system
```
!!!

## Server-side API call demo

### 1. List publications in an organization {#listPublications}

Use the `organizations.publications.list` endpoint to list the Portal
publication and all Creator publications under a given `organizationId`.

### 2. Create a Creator publication {#createPublication}

Use the `organizations.publications.create` endpoint to provision a new Creator
publication under the organization with Subscription Linking enabled. Creating a
publication automatically populates its `publicationId` in Step 3 below.

!!! hint **Primary Domain URL Format**
When creating a Creator publication, `primaryDomain.url` must be a valid
`http://` or `https://` origin with no trailing slash, URL path, query
parameters, or fragments (for example, `https://example.com`).
!!!

```json
{
  "displayName": "{displayName}",
  "languageCode": "en",
  "regionCode": "US",
  "primaryDomain": {
    "url": "{primaryDomainUrl}"
  },
  "slProduct": {
    "enabled": true,
    "gcpProjectNumber": "{{env.GCP_PROJECT_NUMBER}}"
  }
}
```

### 3. Query publication details {#queryPublication}

Use the `organizations.publications.get` endpoint to inspect configuration
details and `primaryDomain.ownershipVerified` status for a specific
`publicationId`.

# Implementation Samples

## A custom client generated from the API discovery document

### Generate a client from the API discovery document

You can use the `google-api-nodejs-client` generator to build a standalone
client package from the Web Content Publisher API Discovery Document
(`https://webcontentpublisher.googleapis.com/$discovery/rest?version=v1`). Note
that `google-api-nodejs-client` is just one of the
[Google API Client Library generators](https://developers.google.com/api-client-library)
that can be used to generate a custom client from the Discovery Document across
supported languages. Refer to
[how to generate a client from the API Discovery Document](https://developers.google.com/news/reader-revenue/monetization/reference/client-configuration#generate_a_client_from_the_api_discovery_document)
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
  parent: 'organizations/{{env.PORTAL_ORGANIZATION_ID}}',
});

// 2. Create a new Creator publication in the organization
const createResponse = await client.organizations.publications.create({
  parent: 'organizations/{{env.PORTAL_ORGANIZATION_ID}}',
  requestBody: {
    displayName: 'Creator Publication',
    languageCode: 'en',
    regionCode: 'US',
    primaryDomain: {
      url: 'https://example.com',
    },
    slProduct: {
      enabled: true,
      gcpProjectNumber: '{{env.GCP_PROJECT_NUMBER}}',
    },
  },
});

// 3. Read (Get) the created Creator publication's details
const createdPubId = createResponse.data.publicationId;
const getResponse = await client.organizations.publications.get({
  name: `organizations/{{env.PORTAL_ORGANIZATION_ID}}/publications/${createdPubId}`,
});
```
