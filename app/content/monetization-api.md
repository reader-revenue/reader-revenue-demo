# Manually query member and order details with the Monetization API

Publishers can use the Monetization API to find out more information about members
and orders using the Monetization API. Unlike the [Publication API](/reference/publication-api),
the Monetization API uses service accounts for server-to-server authentication,
rather than user-scoped `access_token` authentication.

!!! info **Service Account Setup**
For more information on creating and configuring Service Accounts, please see the
[Subscription Linking Service Account Setup](https://developers.google.com/news/subscribe/subscription-linking/implementation/server-side#create_a_service_account) devsite article.
!!!

#### API Tests

Each of the following buttons requires a `readerId` to function. To properly test these,
you can use the [Add Subscribe with Google button](/swg/add-button) example to purchase an
entitlement, and the  [Publication API](/reference/publication-api) example to get your `readerId`.

<div id="readerIdForm"><code>readerId</code> input:</div>
<div id="publicationIdForm"><code>publicationId</code> input:</div>


After setting a `readerId`, the buttons will become available.

!!! hint **Logged-in user is not required**
Unlike the Publication API, which uses Sign in with Google to log in a user and generate an `accessToken`,
the Monetization API does not require this. Any `readerId` for the current publication may be used.
!!!

<table>
  <thead>
    <tr>
      <th>
        Button
      </th>
      <th>
        Details
      </th>
    </tr>
  </thead>
  <tbody>
    <tr id="entitlementsPlans">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Monetization API's <code>entitlementsPlans</code> endpoint to query the full detail of an entitlement for a given <code>readerId</code>.</p>
      </td>
    </tr>
    <tr id="member">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Monetization API to query information on any <code>readerId</code>.</p>
      </td>
    </tr>
    <tr id="order">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Monetization API to query order information for a particular <code>readerId</code>
        for a particular <code>orderId</code>, which can be obtained from the <code>entitlementsPlans</code> endpoint.</p>
      </td>
    </tr>
  </tbody>
</table>

<div id="APIOutput"></div>

# Implementation Samples

While most of the logic for using the Publication API can be done client-side,
certain aspects of the OAuth flow must be done server-side. The following code
samples are split across the client and server, illustrating the type of logic
that should happen at each layer.

## Server-side code sample

After configuring your application to be able to use a service account, you can 
use the generated API client to access the Monetization API.

```javascript
import subscribewithgoogle from '@googleapis/subscribewithgoogle';

/**
 * MonetizationApi
 * A sample class that uses the GoogleApis node.js client and a service
 * account for interacting with the Publication API.
 */
class MonetizationApi {
  constructor() {
    this.auth = new subscribewithgoogle.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.readonly'
      ],
    })
  }

  init() {
    return new subscribewithgoogle.subscribewithgoogle(
        {version: 'v1', auth: this.auth})
  }
}

const api = new MonetizationApi;
const client = api.init();

const readerId = '' //Pull from the Publication APi

const base = `publications/${process.env.PUBLICATION_ID}`;
const endpoint = `readers/${readerId}`;
const name = `${base}/${endpoint}`;
const reader = await client.publications.readers.get({name});
```
