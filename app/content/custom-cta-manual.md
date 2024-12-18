<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg{{#env.SWG_OVERRIDE}}-{{.}}{{/env.SWG_OVERRIDE}}.js">
</script>

<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous">
</script>

# Custom CTA

This page demonstrates how RRM:E Custom CTAs work and documents how to implement them.

## Test the manual custom CTA invocation

<<<<<<< HEAD
<div id="ctas"></div>
=======
<div id="prompts"></div>
>>>>>>> ef9d835 (Initial commit for Custom CTA)

## Custom CTA Overview

The Custom CTA allows publishers to display a customizable dialog with a button. This button redirects users to a specific URL, opening in a new tab. Unlike other CTA types, this CTA does not have a callback, as no data is returned to the publisher from the CTA.

A publisher can configure Custom CTAs for manual invocation using an initialized `swg.js` instance. To use this feature:

1. The publisher configures a Custom CTA in the Publisher Center content access section for their publication.
2. The publisher fetches a valid Custom CTA using the `configurationId`.
3. The publisher displays the CTA, which contains a button that redirects to a custom URL.

### CTA Configuration Examples

After creating a configuration, the Publisher Center provides a `configurationId` for each TYPE_BYO_CTA configuration. These IDs are used in subsequent JavaScript API calls.

```json
[
  {
    "name": "Custom CTA",
    "configurationId": "8c9f1d2b-4f73-4e9d-bdfd-332d19367258"
  }
]
```

!!! note **Note:** Array Not Required
This array of configuration objects is for example purposes only. Publishers must use the `configurationId` to invoke a specific Custom CTA, but are not required to use an array as in these examples.
!!!

### Invoke Custom CTA

To configure Custom CTAs, `swg.js` must first be initialized. These examples demonstrate using the library in `manual` mode, but the APIs are also available in automatic mode.

### Get the Custom CTA instance to display

To invoke a Custom CTA, the publisher must use the `configurationId` from the Publisher Center. Use the `subscriptions.getAvailableInterventions()` method from the initialized `swg.js` library to fetch the configuration.

```javascript
const publisherConfiguration = {
  name: 'Custom CTA',
  configurationId: '8c9f1d2b-4f73-4e9d-bdfd-332d19367258',
};

const availableInterventions = await subscriptions.getAvailableInterventions();

const cta = availableInterventions.find(({configurationId}) => {
    return configurationId === publisherConfiguration.configurationId;
});
```

### Show the Custom CTA

To display the Custom CTA, use the returned value from s`ubscriptions.getAvailableInterventions()` and invoke the `show` method.

```javascript
cta?.show({
    isClosable: true,
});
```

#### Complete Example
This complete example accomplishes the following:

1. Initializes the `swg.js` library in manual mode.
2. Uses the `123e4567-e89b-12d3-a456-426614174000` configurationId to request a TYPE_BYO_CTA CTA to display.
3. When the button is clicked, the user is redirected to the configured URL in a new tab.

```html
<!-- manual swg.js initialization -->
<script async
    subscriptions-control="manual"
    type="application/javascript"
    src="https://news.google.com/swg/js/v1/swg.js">
</script>

<!-- configuring swg.js to invoke and handle Custom CTAs -->
<script type="module">

const ctaConfigurations = [
  {
    name: 'Custom CTA',
    configurationId: '123e4567-e89b-12d3-a456-426614174000',
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

    createButtonForCTA(
      availableInterventions,
      ctaConfiguration,
      buttonEnabledState,
      buttonContainer
    );
  }
});

// Helper function for returning a specific CTA (if available) from all interventions
async function getCTA(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

// Launch a given Custom CTA
async function launchSpecificCTA(cta) {
  cta?.show({
    isClosable: true
  });
}

// Helper function for creating a button to launch a Custom CTA
async function createButtonForCTA(
  availableInterventions,
  ctaConfiguration,
  buttonEnabledState,
  container
) {
  const button = document.createElement('button');
  const cta = await getCTA(
    availableInterventions,
    ctaConfiguration.configurationId
  );

  if (buttonEnabledState == true) {
    button.onclick = () => {
      launchSpecificCTA(cta);
    };
  } else {
    button.setAttribute('disabled', 'true');
  }

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${ctaConfiguration.name}`;
  container.appendChild(button);
}

</script>
```
