<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg{{#env.SWG_OVERRIDE}}-{{.}}{{/env.SWG_OVERRIDE}}.js">
</script>


# Survey CTAs

This page both demonstrates how RRM:E survey sign-up works, as well as documents
how to implement the CTAs.

## Test the manual survey invocation

<div id="ctas"></div>

## Survey CTA Overview

A publisher can configure one or more surveys for manual invocation by using an
initialized `swg.js` instance. In order to use this feature:

1.  The publisher will create a survey in the Publisher Center content access section 
    for their publication.
1.  The publisher will fetch a valid CTA using the `configurationId`, and then 
    display it.
1.  When configuring the CTA display code, a publisher will provide a callback
    that will be used to store the responses from the newsletter signup, and 
    acknowledge to Google that the email address has been saved.


### CTA Configuration Examples

<ul class="flexible-list">
  <!-- <li class="flexible-list-item">
    <img src="/img/newsletter-configurations_0000s_0004_standard.png">
    <pre>
    <code class="hljs language-json">
{
  "publicationId": "asdf-1234",
  "name": "Daily Bugle"
}
    </code>
    </pre>    
  </li> -->
  <li class="flexible-list-item">
    <img src="/img/survey.png">
    <pre>
    <code class="hljs language-json">
{
  "name": "Basic survey",
  "configurationId": "49c12712-9750-4571-8c67-96722561c13a"
}
    </code>
    </pre> 
  </li>
    <li class="flexible-list-item">
    <img src="/img/survey-multi-page.png">
    <pre>
    <code class="hljs language-json">
{
  "name": "Multi-page survey",
  "configurationId": "e98a2efb-d009-43c9-99ef-dda11c8c5a7f"
}
    </code>
    </pre> 
  </li>
</ul>

After creating a configuration, the Publisher Center page will provide a `configurationId` in response for each
newsletter configuration. These ids will then be used in subsequent javascript api calls.

```json
[
  {
    name: 'Basic survey',
    configurationId: '49c12712-9750-4571-8c67-96722561c13a',
  },
  {
    name: 'Multi-page survey',
    configurationId: 'e98a2efb-d009-43c9-99ef-dda11c8c5a7f',
  },
]
```

### Invoke Survey CTAs

To configure survey CTAs, `swg.js` must first be configured on the page.
These examples show using the initialization of the library in `manual` mode, but the
APIs are also available in automatic mode. 

### Get the CTA instance to display

To invoke a survey CTA, a publisher must use the `configurationId` from the Publisher
Center survey configuration page. Publishers use the `configurationId` to fetch a valid 
CTA instance using the `subscriptions.getAvailableInterventions()` method from 
the initialized `swg.js` library.

```javascript
const publisherConfiguration = {
  name: 'Basic survey',
  configurationId: '49c12712-9750-4571-8c67-96722561c13a',
};

const availableInterventions = await subscriptions.getAvailableInterventions();

const cta = availableInterventions.find(({configurationId}) => {
    return configurationId === publisherConfiguration.configurationId;
});
```

### Show the CTA

To display a CTA, use the returned value from `subscriptions.getAvailableInterventions()` and use the `show` method:

```javascript
cta?.show({
    isClosable: true,
    onResult: (result) => {
        //Store the result, which is the email of the newsletter signup.

        //Return true to let Google know that you have received and processed
        //the returned email.
        return true;
    }
});
```

### Handle the response

The `onResult` callback will include information on the configuration used
to create the CTA, as well as the newsletter subscriber's information. The `configurationId` matches the `configurationId provided to the publisher from Google, in response to the configuration authored by the publisher in the initial step.

!!! note `onResult()` callback conforms to the documented type in [github](https://github.com/subscriptions-project/swg-js/blob/main/src/api/available-intervention.ts#L41).
The contents of a CTA determines the shape of the `onResult` callback data.
For example, a single-page survey response will differ in shape from a multi-page survey.
For best results, store the entire result.
!!!

#### Complete Example

This complete example accomplishes the following:

1. Initializes `swg.js` library in manual mode.
2. When the library is ready, use the `49c12712-9750-4571-8c67-96722561c13a` configurationId to request a CTA to display.  
3. When the button is clicked, display the CTA.
4. Store the results of a successful CTA with the sample `CtaPersistence()` library.

!!! note `CtaPersistence()` is an example implementation.
In a production environment, a publisher would use the CTA response to send data to the publisher's customer management system or equivalent. 
!!!

```html
<!-- manual swg.js initialization -->
<script async
    subscriptions-control="manual"
    type="application/javascript"
    src="https://news.google.com/swg/js/v1/swg.js">
</script>

<!-- configuring swg.js to invoke and handle newsletter CTAs -->
<script type="module">

// Example library for storing email signups
import {CtaPersistence} from './cta-persistence.js';
const ctaCache = new CtaPersistence();

const ctaConfigurations = [
  {
    name: 'Basic survey',
    configurationId: '49c12712-9750-4571-8c67-96722561c13a',
  },
  {
    name: 'Multi-page survey',
    configurationId: 'e98a2efb-d009-43c9-99ef-dda11c8c5a7f',
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


<!--  The following helper functions are not required, 
      but help to provide a clear syntax in the above example. -->


// Helper function for returning a specific CTA (if available) from all interventions
async function getCta(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

// Launch a given CTA
async function launchSpecificCta(cta) {
  cta?.show({
    isClosable: true,
    onResult: (result) => {
      console.log(result);
      ctaCache.record(result);
    },
  });
}

// Helper function for creating a button to launch a CTA
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

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${newsletterConfiguration.name}`;
  container.appendChild(button);
}

</script>
```