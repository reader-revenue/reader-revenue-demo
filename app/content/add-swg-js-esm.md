# Add swg.js (ES Module)

!!! info ★**No Demo**: Only code samples are available 
!!!

Initialize SwG client `swg.js` to access all SwG functions on the web. The SwG client is distributed as a JavaScript library at `{{env.SWG_JS_MJS_URL}}`.

For modern web development, using ES Modules is the recommended way to integrate SwG. This method allows for better tree-shaking and module loading optimization.

Read the [documentation](https://developers.google.com/news/subscribe/guides/add-swg-js).

## Try it yourself

### ES Module Initialization

1. Import the SwG client directly into your module using a `<script type="module">` tag or within your build system.
2. Configure the client (optional).
3. Initialize the SwG client using a Publication ID `subscriptions.init(publicationId)` or a Product ID `subscriptions.init(productId)`.

**Note:** ESM initialization is **Passive-by-Default**. Unlike the legacy IIFE version, importing the module does **not** automatically trigger DOM scanning or entitlement checks. You must explicitly call `init()` (for manual configuration) or `start()` (to trigger DOM scanning for Structured Data Markup).

```html 
<html>
  <head>
    <script type="module">
      // 1. Import the subscriptions object
      import { subscriptions } from "{{env.SWG_JS_MJS_URL}}";

      // 2. Explicitly specify the Pay backend version to use
      subscriptions.configure({paySwgVersion: '2'});

      // 3. Initialize using a Publication ID or a Product ID
      subscriptions.init(publicationOrProductId);

      // Alternatively, if you have Structured Data Markup on the page and want SwG to use it:
      // subscriptions.start();
    </script>
  </head>
  <body>
    <p>Your article content</p>
  </body>
</html>
```
