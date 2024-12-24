<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Handle a purchase from swg.js


This demo uses `performance.now()` to monitor the response time from receiving a payment response to being able to use it across both the `readers` and `entitlementsplans` endpoint. To use this demo, purchase an entitlement using the below button, and observe the timing of the various responses.

<button id="swg-standard-button"></button>

<div id="output"></div>


## The readers endpoint

The `readers` example uses code based on the below example. This code creates an interval to run every 50ms, 

```javascript

let startTime = performance.now()

let memberInterval = setInterval(async ()=>{
  
  //Use the Monetization API's /readers endpoint
  let data = await queryMemberData('process.env.PUBLICATION_ID', readerId)
  try {

    //If there is a valid email address in the response, stop the timer and output the data.
    const { emailAddress } = data;
    if (emailAddress != undefined && emailAddress != "") {
      const endTime = performance.now()
      const elapsedTime = endTime - startTime
      console.log({emailAddress, startTime, endTime, elapsedTime})
      insertHighlightedJson(
        '#output', 
        {emailAddress, startTime, endTime, elapsedTime},
        'Response time for the <code>readers</code> endpoint')
      clearInterval(memberInterval);
    }
  } catch (e) {
    console.log(`emailAddress parse error at ${performance.now()}`, e)
  }
}, 50);
```

## The entitlementsplans endpoint

The `entitlementsplans` example is the same as the `readers` example, except instead looks for the `planId` and `latestOrderId` as values indicating that the correct data has been returned.

```javascript
let startTime = performance.now()

let entitlementsInterval = setInterval(async ()=>{

  //Query the entitlementsplans endpoint
  let data = await queryLocalEntitlementsPlans('process.env.PUBLICATION_ID', readerId)
  try {

    //If there is a valid planId and latestOrderId, output it and return
    const planId = data.userEntitlementsPlans[0].planId ?? undefined;
    const latestOrderId = data.userEntitlementsPlans[0].purchaseInfo.latestOrderId ?? undefined;
    if (planId && latestOrderId) {
      const endTime = performance.now()
      const elapsedTime = endTime - startTime
      console.log({planId, latestOrderId, startTime, endTime, elapsedTime})
      insertHighlightedJson(
        '#output', 
        {planId, latestOrderId, startTime, endTime, elapsedTime},
        'Response time for the <code>entitlementsplans</code> endpoint')
      clearInterval(entitlementsInterval);
    }
  } catch (e) {
    console.log(`planId and latestOrderId parse error at ${performance.now()}`, e)
  }
}, 50);
```