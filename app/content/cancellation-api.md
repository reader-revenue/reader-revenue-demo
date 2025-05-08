# [WIP] Cancellation API Demo 

TODO

!!! info **Service Account Setup**
TODO
!!!

#### API Tests

TODO

<div id="readerIdForm"><code>readerId</code> input:</div>
<div id="publicationIdForm"><code>publicationId</code> input:</div>
<div id="entitlementsPlansIdForm"><code>entitlementsPlansId</code> input:</div>
<div id="orderIdForm"><code>orderId</code> input:</div>

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
    <tr id="cancelEntitlementsPlansButton">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Cancellation API's <code>entitlementsPlans</code> endpoint to cancel an entitlement for a given <code>readerId</code> and <code>entitlementsPlansId</code>.</p>
      </td>
    </tr>
    <tr id="refundOrderButton">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Cancellation API's <code>refundOrder</code> endpoint to process a refund for a given <code>readerId</code> and <code>orderId</code>.</p>
      </td>
    </tr>
  </tbody>
</table>

<div id="APIOutput"></div>

# Implementation Samples

TODO

## Server-side code sample

TODO