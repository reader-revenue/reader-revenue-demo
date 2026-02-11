# Survey CTAs (ESM)

This page both demonstrates how RRM:E survey sign-up works using ES Modules, as well as documents how to implement the CTAs.

## Test the manual survey invocation

<div id="ctas"></div>

## Survey CTA Overview

### Invoke Survey CTAs

To configure survey CTAs, SwG must first be imported and initialized. 

### Get the CTA instance to display

```javascript
// 1. Import SwG
import { subscriptions } from "{{env.SWG_JS_MJS_URL}}";

// 2. Wait for the runtime to be ready
await subscriptions.ready();

// 3. Initialize SwG
subscriptions.init('{{env.PUBLICATION_ID}}');

// 4. Fetch the available interventions
const availableInterventions = await subscriptions.getAvailableInterventions();

// 5. Find your specific CTA
const cta = availableInterventions.find(({configurationId}) => {
    return configurationId === 'YOUR_CONFIGURATION_ID';
});
```

### Show the CTA

To display a CTA, use the returned value from `subscriptions.getAvailableInterventions()` and use the `show` method:

```javascript
cta?.show({
    isClosable: true,
    onResult: (result) => {
        console.log('Survey result:', result);
        return true;
    }
});
```
