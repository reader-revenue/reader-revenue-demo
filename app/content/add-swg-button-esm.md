# Add Subscribe with Google button (ESM)

There are two methods of showing Subscribe with Google button on your website using ES Modules.

### Standard Button

<button id="swg-standard-button"></button>

### Smart Button

Smart Button renders the button with a contextual message underneath the button.

<button id="swg-smart-button"></button>

Read the [documentation](https://developers.google.com/news/subscribe/guides/sell-subscriptions-on-web#display-buttons).

### Offer Button

<button id="swg-offer-button"></button>

## Try it yourself

### Standard Button

1. Import the `subscriptions` object from `swg.mjs`.
2. Create a `<button>` DOM element in your page where you want the Subscribe with Google button to appear.
3. Use the `attachButton()` function from `subscriptions` to render a standard button.
4. Include button options and callback functions.

```html
<script type="module">
  // 1. Import SwG
  import { subscriptions } from "{{env.SWG_JS_MJS_URL}}";

  // Wait for the runtime to be ready
  await subscriptions.ready();

  // Initialize SwG
  subscriptions.init('{{env.PUBLICATION_ID}}');

  // 3. Render the standard button onto the DOM element
  let swgStdButton = document.getElementById("swg-standard-button");
  subscriptions.attachButton(
    swgStdButton,
      // 4. Include options i.e. light styles or languages..
    {theme: 'light', lang: 'en'},
      // .. and onclick functions in the callback i.e. showOffers or subscribe(SKU)
    function() {
      subscriptions.showOffers({ isClosable: true }) // Show offers carousel
    });
</script>
```

### Smart Button

1. Import the `subscriptions` object from `swg.mjs`.
2. Create a `<button>` DOM element in your page where you want the Subscribe with Google button to appear.
3. Use the `attachSmartButton()` function from `subscriptions` to render the smart button.
4. Include button options and callback functions.

```html
<script type="module">
  // 1. Import SwG
  import { subscriptions } from "{{env.SWG_JS_MJS_URL}}";

  // Wait for the runtime to be ready
  await subscriptions.ready();

  // Initialize SwG
  subscriptions.init('{{env.PUBLICATION_ID}}');

  // 3. Render the smart button onto the DOM element
  let swgSmartButton = document.getElementById("swg-smart-button");
  subscriptions.attachSmartButton(
    swgSmartButton,
      // 4. Include options i.e. light styles or languages..
    {theme: 'light', lang: 'en'},
      // .. and onclick functions in the callback i.e. showOffers or subscribe(SKU)
    function() {
      subscriptions.showOffers({ isClosable: true }) // Show offers carousel
    });
</script>
```
