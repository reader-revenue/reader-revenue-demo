<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg{{#env.SWG_OVERRIDE}}-{{.}}{{/env.SWG_OVERRIDE}}.js">
</script>

<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous">
</script>

# Rewarded Ads

This page demonstrates how RRM:E rewarded ads work and documents how to implement them.

## Test the manual rewarded ad invocation

<div id="ctas"></div>

## Rewarded Ads Overview

A publisher can configure rewarded ads for manual invocation using an initialized `swg.js` instance. To use this feature:

1. The publisher configures a rewarded ad in the Publisher Center content access section for their publication.
2. The publisher fetches a valid rewarded ad using the `configurationId` and then displays it.
3. When configuring the rewarded ad display code, the publisher provides a callback to store the user engagement result and acknowledge the interaction.

### CTA Configuration Examples

<ul class="flexible-list">
  <li class="flexible-list-item">
    <img src="/img/rewarded-ads.png">
    <pre>
    <code class="hljs language-json">
{
  "name": "Rewarded Ad",
  "configurationId": "8c9f1d2b-4f73-4e9d-bdfd-332d19367258"
}
    </code>
    </pre> 
  </li>
</ul>

After creating a configuration, the Publisher Center provides a `configurationId` for each rewarded ad configuration. These IDs are used in subsequent JavaScript API calls.

```json
[
  {
    "name": "Rewarded Ad",
    "configurationId": "8c9f1d2b-4f73-4e9d-bdfd-332d19367258"
  }
]
```

!!! note **Note:** Array Not Required
This array of configuration objects is for example purposes only. Publishers must use the `configurationId` to invoke a specific rewarded ad, but are not required to use an array as in these examples.
!!!

### Invoke Rewarded Ads CTAs

To configure rewarded ads, `swg.js` must first be initialized. These examples demonstrate using the library in `manual` mode, but the APIs are also available in automatic mode.

### Get the rewarded ad CTA instance to display

To invoke a rewarded ad CTA, the publisher must use the `configurationId` from the Publisher Center. Use the `subscriptions.getAvailableInterventions()` method from the initialized `swg.js` library to fetch the ad configuration.

```javascript
const publisherConfiguration = {
  name: 'Rewarded Ad',
  configurationId: '8c9f1d2b-4f73-4e9d-bdfd-332d19367258',
};

const availableInterventions = await subscriptions.getAvailableInterventions();

const cta = availableInterventions.find(({configurationId}) => {
    return configurationId === publisherConfiguration.configurationId;
});
```

### Show the rewarded ad CTA

To display the rewarded ad CTA, use the returned value from `subscriptions.getAvailableInterventions()` and invoke the `show` method:

```javascript
cta?.show({
    isClosable: true,
    onResult: (result) => {
        // Handle user engagement results here.
        // For example, store the engagement and return true to confirm.
        console.log(result);
        return true;
    }
});
```

### Handle the response

The `onResult` callback includes the user engagement result. The `configurationId` matches the ID provided to the publisher from Google in the Publisher Center.

!!! note The `onResult` callback conforms to the documented type in [SwG GitHub](https://github.com/subscriptions-project/swg-js/blob/main/src/api/available-intervention.ts#L43).
!!!

#### Complete Example

This complete example accomplishes the following:

1. Initializes `swg.js` library in manual mode.
2. When the library is ready, use the `8c9f1d2b-4f73-4e9d-bdfd-332d19367258` configurationId to request a rewarded ad to display.  
3. When the button is clicked, display the rewarded ad.
4. Store the results of a successful rewarded ad engagement with the sample `CtaPersistence()` library.

!!! note `CtaPersistence()` is an example implementation.
In a production environment, a publisher would use the rewarded ad response to send data to the publisher's customer management system or equivalent. 
!!!

```html
<!-- manual swg.js initialization -->
<script async
    subscriptions-control="manual"
    type="application/javascript"
    src="https://news.google.com/swg/js/v1/swg.js">
</script>

<!-- configuring swg.js to invoke and handle rewarded ads -->
<script type="module">

// Example library for storing engagement data
import {CtaPersistence} from './cta-persistence.js';
const ctaCache = new CtaPersistence();

const ctaConfigurations = [
  {
    name: 'Rewarded Ad',
    configurationId: '8c9f1d2b-4f73-4e9d-bdfd-332d19367258',
  },
];

const buttonContainer = document.querySelector('#ctas');

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  subscriptions.configure({paySwgVersion: '2'});
  subscriptions.init('{{env.PUBLICATION_ID}}');

  // Configure the event manager to log all events to the console
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);

  const availableInterventions =
    await subscriptions.getAvailableInterventions();

  // For debugging, view all available interventions in the browser console
  console.log({availableInterventions});

  const availableInterventionConfigurationIds = availableInterventions.map(
    (availableIntervention) => availableIntervention.configurationId
  );

  for (const ctaConfiguration of ctaConfigurations) {
    const buttonEnabledState = availableInterventionConfigurationIds.includes(
      ctaConfiguration.configurationId
    );

    createButtonForCta(
      availableInterventions,
      ctaConfiguration,
      buttonEnabledState,
      buttonContainer
    );
  }
});

// The following helper functions are not required but help to provide a clear syntax in the above example.

// Helper function for returning a specific rewarded ad (if available) from all interventions
async function getCta(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

// Launch a given rewarded ad
async function launchSpecificCta(cta) {
  cta?.show({
    isClosable: true,
    onResult: (result) => {
      console.log(result);
      ctaCache.record(result); // Record the engagement result
    },
  });
}

// Helper function for creating a button to launch a rewarded ad
async function createButtonForCta(
  availableInterventions,
  ctaConfiguration,
  buttonEnabledState,
  container
) {
  const button = document.createElement('button');
  const cta = await getCta(
    availableInterventions,
    ctaConfiguration.configurationId
  );

  if (buttonEnabledState == true) {
    button.onclick = () => {
      launchSpecificCta(cta);
    };
  } else {
    button.setAttribute('disabled', 'true');
  }

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${ctaConfiguration.name}`;
  container.appendChild(button);
}

</script>
```
