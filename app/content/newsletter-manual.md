<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg{{#env.SWG_OVERRIDE}}-{{.}}{{/env.SWG_OVERRIDE}}.js">
</script>

# Newsletter CTAs

This page both demonstrates how RRM:E newsletter sign-up works, as well as documents
how to implement the CTAs.

## Test the manual newsletter invocation

<div id="ctas"></div>

## Newsletter CTA Overview

A publisher can configure one or more newsletters for manual invocation by using an
initialized `swg.js` instance. In order to use this feature:

1.  A publisher will provide Google with a CTA configuration per newsletter, and 
    will receive a `configurationId` in response to call this newsletter configuration.
1.  A publisher will fetch a valid CTA using the `configurationId`, and then display it.
1.  When configuring the CTA display code, a publisher will provide a callback
    that will be used to store the responses from the newsletter signup, and 
    acknowledge to Google that the email address has been saved.

## Configure CTAs

During the manual configuration beta of the Newsletter feature of RRM:E, publishers must
provide a manual configuration for each newsletter that they would like configured. The
configuration for each newsletter will determine which features are displayed in the
CTA, and what data is passed to the publisher for each subscriber.

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
    <img src="/img/newsletter-configurations_0000s_0003_with-title.png">
    <pre>
    <code class="hljs language-json">
{
  "publicationId": "asdf-1234",
  "title": "Your favorite news, delivered directly to your inbox."
}
    </code>
    </pre> 
  </li>
    <li class="flexible-list-item">
    <img src="/img/newsletter-configurations_0000s_0002_with-title-and-body.png">
    <pre>
    <code class="hljs language-json">
{
  "publicationId": "asdf-1234",
  "title": "Your favorite news, delivered directly to your inbox.",
  "body": "Sign up to receive the morning newsletter from the Daily Bugle, with editorially-selected articles, sports updates and more."
}
    </code>
    </pre> 
  </li>
    <li class="flexible-list-item">
    <img src="/img/newsletter-configurations_0000s_0001_with-title-and-body-and-consent.png">
    <pre>
    <code class="hljs language-json">
{
  "publicationId": "asdf-1234",
  "title": "Your favorite news, delivered directly to your inbox.",
  "body": "Sign up to receive the morning newsletter from the Daily Bugle, with editorially-selected articles, sports updates and more.",
  "permission": true,
  "permissionDescription": "Allow the Daily Bugle to send you deals, subscription offers and other marketing info."
}
    </code>
    </pre> 
  </li>
  <!-- <li class="flexible-list-item">
    <img src="/img/newsletter-configurations_0000s_0000_alternate.png">
    <pre>
    <code class="hljs language-json">
{
  "publicationId": "asdf-1234",
  "name": "Superhero Shots by the Daily Bugle",
  "title": "Daily photo updates from around the town",
  "body": "Sign up to receive breaking updates from around the web by intrepid photojournalists on the street."
}
    </code>
    </pre> 
  </li> -->
</ul>

### Provide CTA Configuration to Google

Configurations for newsletters may include the following fields.

- **Publication Id** (as found in the Publisher Center configuration for the RRM:E publication)
- **Newsletter title** _(text)_ - The title of the newsletter, which appears below the name
- **Newsletter body** _(text)_ - A description of the newsletter
- **Show a permission checkbox?** _(true/false)_ - A checkbox to determine if additional acceptance should be required of the newsletter subscriber
- **Permission description** _(text)_ _optional_- A label for the permission checkbox. Required if showing a permission checkbox is required.

!!! caution **NOTE:** `publicationId` and `name` are **required**, but all other fields are optional.
!!!

In response, Google will provide a `configurationId` for each newsletter. 


#### Configuration for the sample CTAs

This page includes two newsletter configurations. They were created with the following configuration:

```json
[
  {
    publicationId: '{{env.PUBLICATION_ID}}',
    title: 'Subscriber Newsletter',
    body: 'As a premium benefit, enjoy curated subscriber news'
  },
  {
    publicationId: '{{env.PUBLICATION_ID}}',
    name: 'Breaking News',
    body: 'Breaking news delivered to you right away',
    permission: true,
    permissionDescription: 'Consent to marketing materials'
  }
]
```

!!! note Newsletter configurations can be provided in any format
The newsletter configuration above is represented as a `json` object, but any format can be used. 
During the alpha phase, this is a manual configuration.
!!!

After submitting a configuration, Google will provide a `configurationId` in response for each
newsletter configuration. These ids will then be used in subsequent javascript api calls.

```json
[
  {
    name: 'Subscriber Newsletter',
    configurationId: '49c12712-9750-4571-8c67-96722561c13a',
  },
  {
    name: 'Breaking News',
    configurationId: 'e98a2efb-d009-43c9-99ef-dda11c8c5a7f',
  },
]
```

### Invoke Newsletter CTAs

To configure newsletter CTAs, `swg.js` must first be configured on the page.
These examples show using the initialization of the library in `manual` mode, but the
APIs are also available in automatic mode. 

### Get the CTA instance to display

To invoke a newsletter CTA, a publisher must use the `configurationId` provided by
Google in response to submitting a CTA configuration. Publishers use the
`configurationId` to fetch a valid CTA instance using the `subscriptions.getAvailableInterventions()` method from the initialized `swg.js` library.

```javascript
const publisherConfiguration = {
  name: 'Subscriber Newsletter',
  configurationId: '49c12712-9750-4571-8c67-96722561c13a',
};

const availableInterventions = await subscriptions.getAvailableInterventions();

const cta = availableInterventions.find(({configurationId}) => {
    return configurationId === publisherConfiguration.configurationId;
});
```

### Show the CTA

To display a cta, use the returned value from `subscriptions.getAvailableInterventions()` and use the `show` method:

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

By default a toast like the one shown below will appear after the user has completed the signup flow. 

<img src="/img/newsletter-toast.png">


If you prefer not to show this toast, you can set  `suppressToast` option to `true`.

```javascript
cta?.show({
    isClosable: true,
    suppressToast: true,
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
to create the CTA, as well as the newsletter subscriber's information. The `configurationId` matches the `configurationId provided to the publisher from Google, in response to the per-newsletter configuration authored by the publisher in the initial step.

```javascript
{
  'configurationId': '123-456-789',
  'data': {
    'userEmail': 'example@example.com',
    'displayName': 'John Johnson',
    'givenName': 'John',
    'familyName': 'Johnson'
  }
}
```

#### Complete Example

This complete example accomplishes the following:

1. Initializes `swg.js` library in manual mode.
2. When the library is ready, use the `newsletter-1234` configurationId to request a CTA to display.  
3. When the button is clicked, display the CTA.
4. Store the results of a successful CTA with the sample `NewsletterPersistence()` library.
<<<<<<< HEAD

=======
CTA
>>>>>>> 6118cdb (replacing 'prompt' with 'CTA')
!!! note `CtaPersistence()` is an example implementation.
In a production environment, a publisher would use the CTA response to send data to their own
account or customer management system. 
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
    name: 'Subscriber Newsletter',
    configurationId: '49c12712-9750-4571-8c67-96722561c13a',
  },
  {
    name: 'Breaking News',
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
      newsletterCache.signup(result);
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