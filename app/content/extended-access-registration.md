<script async src="https://accounts.google.com/gsi/client" defer></script>
<script async subscriptions-control="manual" src="https://news.google.com/swg/js/v1/swg.js"></script>
<script async src="https://news.google.com/swg/js/v1/swg-gaa.js"></script>

# Extended Access - Registration Flow

Launch a registration dialog for anonymous users to sign up and gain extended access to paid articles.

By clicking on 'Continue with Google', readers let Google share their Google profile information with 
you. The user profile information object is the same as the one you get from [Sign in with Google](https://developers.google.com/identity/gsi/web/reference/js-reference#credential),
and can be used to create an account for the user. We recommend using the value of the `sub` field
to uniquely identify users, as email addresses may change, or become unavailable in the future.

## Simulated Paywalled Content

<p id="paywalledContent" style="filter: blur(4px)">
  This content is paywalled or behind a registration wall.
</p>

<button id="redirect" class="btn btn-primary">Simulate Showcase Click</button>
<button id="revoke" class="btn btn-secondary">Revoke GIS Token Grant</button>

<div id="output"></div>

!!! note **State Maintenance**
Google maintains no session state for the user. It is up to the publisher to handle state after registration through their existing user state management system.
!!!

For more information, read the [documentation](https://developers.google.com/news/subscribe/extended-access/integration-steps/web-implementation?feed=client-side#handle-registration-for-new-users)
and [code samples](https://developers.google.com/news/subscribe/extended-access/reference/sample-code?paywall_type=client-side#code-select).