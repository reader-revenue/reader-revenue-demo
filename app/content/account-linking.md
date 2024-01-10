<script async
  subscriptions-control="manual" 
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Account Linking

## Client-side Javascript Demo

This button will attempt to link your account. Afterwards, if you authenticate 
as the same user in the [Publication API](/reference/publication-api) example,
the default linked entitlements will be visible via the `/entitlements` endpoint.

To unlink this account (and remove the entitlements), visit the Google
[My Account - Subscriptions](https://myaccount.google.com/subscriptions)
management page and choose "unlink" next to the newly linked publication.

!!! caution **Local and Linked State**
Resetting the local account linking state using the sample `accountLinkingPersistence`
class does not reset or unlink the user in their `My Account` page. It is a
convenience button to help developers quickly reset the local state only.
!!!

<button id="accountLink" class="btn btn-primary">Link your account with Account Linking</button>
<button id="accountLinkReset" class="btn btn-secondary">Reset your local account linking state cache</button>
<div id="output"></div>

## Implementation Details

Read the documentation.

Entitlements API and other required endpoints for OAuth 2.0 flow need to be defined in Publisher Center. For more information setting up endpoints, please read Set up Subscribe with Google for your publication.

The Console DevTool is available to test account linking. For more information, please read Test account linking.

## Sample Implementation

1. Include `swg.js`: `<script async src="https://news.google.com/swg/js/v1/swg.js"></script>`
1. Include Google Platform Library: `<script async src="https://apis.google.com/js/platform.js"></script>`
1. Click on "Link your account"

```html
<script async type="application/javascript" src="https://news.google.com/swg/js/v1/swg.js"></script>
<script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "NewsArticle",
    "headline": "gTech Swg Demo",
    "image": "/icons/icon-2x.png",
    "datePublished": "2025-02-05T08:00:00+08:00",
    "dateModified": "2025-02-05T09:20:00+08:00",
    "author": {
    "@type": "Person",
    "name": "John Doe"
    },
    "publisher": {
        "name": "GTech Demo Pub News",
        "@type": "Organization",
        "@id": "gtech-demo-staging.appspot.com",
        "logo": {
        "@type": "ImageObject",
        "url": "/icons/icon-2x.png"
        }
    },
    "description": "This example loads a carousel of offers on click.",
    "isAccessibleForFree": "False",
    "isPartOf": {
        "@type": ["CreativeWork", "Product"],
        "name" : "GTech Demo Pub News basic",
        "productID": "gtech-demo-staging.appspot.com:basic"
    }
  }
</script>
<script>
  (self.SWG = self.SWG || []).push( async subscriptions => {
    // For OAuth 2.0 authorization code flow the Promise should resolve with { authCode: 'auth_code' }
    // For OAuth 2.0 implicit flow the  Promise should resolve with { token: 'entitlements_access_token' }
    const requestPromise = Promise.resolve({ token: 'publisher_provided_access_token' });
    const result = await subscriptions.saveSubscription(() => requestPromise);
    console.log("User Acceptance", result ? "Yes" : "No");
  })
</script>
```