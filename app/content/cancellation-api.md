# Cancel Entitlements Plans and Refund Orders with the Cancellation API

The [Cancellation API](https://developers.google.com/news/reader-revenue/monetization/reference/cancellation-api) lets you cancel entitlements (subscription plans) or refund orders for a user. 

- Offer a cancellation and refund mechanism on your website, as opposed to asking RRM subscribers to go to Payments Center to cancel their subscription. 
- This lets you create a consistent cancellation experience for all their subscribers regardless of acquisition channel

!!! info **Service Account Setup**
For more information on creating and configuring Service Accounts, please see the
[Monetization API Service Account Setup](https://developers.google.com/news/reader-revenue/monetization/reference/monetization-api#endpoint_authentication_with_service_accounts) devsite article.
!!!

#### API Tests

<div id="publicationIdForm"><code>publicationId</code> input:</div>
<div id="readerIdForm"><code>readerId</code> input:</div>
<div id="entitlementsPlansIdForm"><code>entitlementsPlansId</code> input:</div>
<div id="orderIdForm"><code>orderId</code> input:</div>
<div id="cancellablePlans"></div>
<br>
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
    <tr id="cancelEntitlementsPlansButton">
      <td>
        <div class="button"></div>
        <br>
        <input id="cancelImmediately" type="checkbox" checked>&nbsp;&nbsp;Cancel immediately</input>
      </td>
      <td>
        <p>Use the Cancellation API's <a href="https://developers.google.com/news/reader-revenue/monetization/sell/cancel-entitlements"><code>entitlementsPlans</code></a> endpoint to cancel an entitlement for a given <code>readerId</code> and <code>entitlementsPlansId</code>.</p>
      </td>
    </tr>
    <tr id="refundOrderButton">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Cancellation API's <a href="https://developers.google.com/news/reader-revenue/monetization/manage/refunds"><code>refundOrder</code></a> endpoint to process a refund for a given <code>readerId</code> and <code>orderId</code>.</p>
      </td>
    </tr>
  </tbody>
</table>

<div id="APIOutput"></div>

<br>

# Implementation Samples

## A custom client generated rom the API discovery document  

### Generate a client from the API discovery document 

You can use the generators to create a custom client based on the [Discovery Document](https://developers.devsite.corp.google.com/api-client-library). Refer [how to generate a client from the API Discovery Document](https://developers.google.com/news/reader-revenue/monetization/reference/client-configuration#generate_a_client_from_the_api_discovery_document) for an example in Node.js . 

!!! hint **Regenerate your client for the Cancellation API**
The Cancellation API endpoints are newer than the Publication and Monetization API endpoints. If your client was generated before the Cancellation API was supported, you must regenerate it using the latest API Discovery Document.
!!!

### Server-side code sample (Node.js)

Refer to the [developer site](https://developers.devsite.corp.google.com/news/reader-revenue/monetization/reference/client-configuration#use_the_custom_client_generated_from_the_api_discovery_document) for more details.


```javascript
import subscribewithgoogle from '@googleapis/subscribewithgoogle';

/**
 * CancellationAPI
 * A sample class that uses the GoogleApis node.js client and a service
 * account for interacting with the CancellationAPI API.
 */
class CancellationAPI {
  constructor() {
    this.auth = new subscribewithgoogle.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.manage'
      ],
    })
  }

  init() {
    return new subscribewithgoogle.subscribewithgoogle(
        {version: 'v1', auth: this.auth})
  }
}

/**
 * POST /publications/{publicationId}/readers/{readerId}/orders/{orderId}:refund
 */
async refundOrders(){
  const publicationId = ''; //TODO
  const readerId = ''; //TODO
  const orderId = ''; //TODO
  const name = `publications/${publicationId}/readers/${readerId}/orders/${orderId}`;
  const response = await client.publications.readers.orders.refund({
    name,
    // boolean value to decide cancel the subscription immediately, or wait for the end of the current cycle period
    cancelImmediately: false
  });
  return res.json(response.data);
}

/**
 * POST /publications/{publicationId}/readers/{readerId}/entitlementsplans/{entitlementsPlanId}:cancel
 */
async cancelEntitlementsPlans(){
  const publicationId = ''; //TODO
  const readerId = ''; //TODO
  const entitlementsPlanId = ''; //TODO
  const name = `publications/${publicationId}/readers/${readerId}/entitlementsplans/${entitlementsPlanId}`;
  const response = await client.publications.readers.orders.refund({name});
  return res.json(response.data);
}
```

## REST API

Alternatively, you can call the REST API endpoints. Refer to the [developer site](https://developers.google.com/news/reader-revenue/monetization/reference/client-configuration#rest-api) section for more details.
