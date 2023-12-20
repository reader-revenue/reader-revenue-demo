/**
 * @fileoverview Description of this file.
 */

/**
 * analyticsEventLogger
 * @param {{Object}} subs
 */
function analyticsEventLogger(subs) {
    subs.getEventManager().then(manager => {
      manager.registerEventListener((event) => {
        console.log('New analytics event: ', event);
      });
    });
  }
  
  (self.SWG = self.SWG || []).push(subscriptions => {
    analyticsEventLogger(subscriptions);
  
    // subscriptions.start();
  
    // 3. Render the smart button onto the DOM element
    let swgStdButton = document.getElementById('swg-standard-button');
    subscriptions.attachButton(
        swgStdButton,
        // 4. Include options i.e. light styles or languages..
        {theme: 'light', lang: 'en'},
        // .. and onclick functions in the callback i.e.
        // showOffersor subscribe(SKU)
        function() {
          subscriptions.showOffers({isClosable: true});  // Show offers carousel
        });
  
    let swgOfferButton = document.getElementById('swg-offer-button');
    subscriptions.attachButton(
        swgOfferButton,
        // 4. Include options i.e. light styles or languages..
        {theme: 'light', lang: 'en'},
        // .. and onclick functions in the callback i.e.
        // showOffersor subscribe(SKU)
        function() {
          subscriptions.subscribe(
              'SWGPD.1364-3969-4803-51719');  // Show offers carousel
        });
  
  
    let swgSmartButton = document.getElementById('swg-smart-button');
    subscriptions.attachSmartButton(
        swgSmartButton,
        // 4. Include options i.e. light styles or languages..
        {theme: 'light', lang: 'en'},
        // .. and onclick functions in the callback i.e.
        // showOffersor subscribe(SKU)
        function() {
          subscriptions.showOffers({isClosable: true});  // Show offers carousel
        });
  
    subscriptions.setOnPaymentResponse(async (paymentResponse) => {
      let response = await paymentResponse;
      console.log(response);
      await response.complete();
      console.log(
          'response and transaction is complete, launching entitlements flow');
  
      const entitlements = await subscriptions.getEntitlements();
      console.log('Entitlements from setOnPaymentsResponse', entitlements);
    });
  
    subscriptions.setOnEntitlementsResponse(async (entitlementsResponse) => {
      const entitlements = await entitlementsResponse;
      console.log('Entitlements from setOnEntitlementsResponse', entitlements);
    });
  });