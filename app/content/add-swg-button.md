<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Add Subscribe with Google button

There are two methods of showing Subscribe with Google button on your website.


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



1. [Add swg.js](https://gtech-demo.appspot.com/html/configure-swgjs.html).
2. Create a `<button>` DOM element in your page where you want the Subscribe with Google button to appear.
3. Use the `attachButton()` function from `swg.js` to render a standard button.
4. Include button options and callback functions. For more options, please refer to our [GitHub reference](https://github.com/subscriptions-project/swg-js/blob/master/docs/buttons.md#smart-button).



```html
<html>
  <head>
    <!-- 1. Configure swg.js ... -->
    <script async type="application/javascript"
            src="https://news.google.com/swg/js/v1/swg.js"></script>
    <script>
      (self.SWG = self.SWG || []).push( subscriptions => {
          // 3. Render the smart button onto the DOM element
          let swgStdButton = document.getElementById("swg-standard-button");
          subscriptions.attachButton(
            swgStdButton,
             // 4. Include options i.e. light styles or languages..
            {theme: 'light', lang: 'en'},
             // .. and onclick functions in the callback i.e. showOffersor subscribe(SKU)
            function() {
              subscriptions.showOffers({ isClosable: true }) // Show offers carousel
            });
      });
    </script>
  </head>
  <body>
    <!-- 2. Add the button DOM element -->
    <button id="swg-standard-button"></button>

    <!-- ...include structured markup data in step 1. -->
    <script type="application/ld+json">{....}</script>
  </body>
</html>
```



### Smart Button



1. [Add swg.js](https://gtech-demo.appspot.com/html/configure-swgjs.html).
2. Create a `<button>` DOM element in your page where you want the Subscribe with Google button to appear.
3. Use the `attachSmartButton()` function from `swg.js` to render the smart button.
4. Include button options and callback functions. For more options, please refer to our [GitHub reference](https://github.com/subscriptions-project/swg-js/blob/master/docs/buttons.md#smart-button).


```html
<html>
  <head>
    <!-- 1. Add swg.js ... -->
    <script async type="application/javascript"
            src="https://news.google.com/swg/js/v1/swg.js"></script>
    <script>
      (self.SWG = self.SWG || []).push( subscriptions => {
          // 3. Render the smart button onto the DOM element
          let swgSmartButton = document.getElementById("swg-smart-button");
          subscriptions.attachSmartButton(
            swgSmartButton,
             // 4. Include options i.e. light styles or languages..
            {theme: 'light', lang: 'en'},
             // .. and onclick functions in the callback i.e. showOffersor subscribe(SKU)
            function() {
              subscriptions.showOffers({ isClosable: true }) // Show offers carousel
           });
      });
    </script>
  </head>
  <body>
    <!-- 2. Add the button DOM element -->
    <button id="swg-smart-button"></button>

    <!-- ...include structured markup data in step 1. -->
    <script type="application/ld+json">{....}</script>
  </body>
</html>
```
