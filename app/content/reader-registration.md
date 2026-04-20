<script async src="https://accounts.google.com/gsi/client" defer></script>
<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg{{#env.SWG_OVERRIDE}}-{{.}}{{/env.SWG_OVERRIDE}}.js">
</script>

# Reader Registration

This page demonstrates how Reader Registration CTAs work and documents how to implement them.
Refer to [the Developer documentation](https://developers.google.com/news/reader-revenue/content-access/ctas/type/reader-registration) for more information.

## Test the manual reader registration invocation

<button id="clear-storage">Clear Local Storage & Reload</button>

<div id="ctas"></div>

## Reader Registration Overview

Reader Registration allowing publishers to display a dialog for users to register. This is similar to a Custom CTA but specifically tailored for registration flows.

To use this feature:

1. The publisher configures a Reader Registration CTA in the Publisher Center.
2. The publisher fetches a valid CTA using the `configurationId` or by type `TYPE_REGISTRATION_WALL`.
3. The publisher displays the CTA.

### Invoke Reader Registration

To configure Reader Registration CTAs, `swg.js` must first be initialized. These examples demonstrate using the library in `manual` mode.

### Get the CTA instance to display

To invoke a Reader Registration CTA, the publisher can use the `subscriptions.getAvailableInterventions()` method from the initialized `swg.js` library to fetch the configuration.

```javascript
const availableInterventions = await subscriptions.getAvailableInterventions();

const cta = availableInterventions.find(({type}) => {
    return type === 'TYPE_REGSTRATION_WALL';
});
```

### Show the CTA

To display the CTA, use the returned value and invoke the `show` method.

```javascript
cta?.show({
    isClosable: true,
    onResult: (response) => {
        console.log(response.data); // you can retrieve the user information here
        return true;
    }
});
```
