<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg{{#env.SWG_OVERRIDE}}-{{.}}{{/env.SWG_OVERRIDE}}.js">
</script>

Env var: {{env.PUBLICATION_ID}}

# Newsletter prompts

This page both demonstrates how RRM:E newsletter sign-up works, as well as documents
how to implement the prompts.

## Test the manual newsletter invocation

<div id="prompts"></div>

## Newsletter Prompt Overview

A publisher can configure one or more newsletters for manual invocation by using an
initialized `swg.js` instance. In order to use this feature:

1.  A publisher will provide Google with a prompt configuration per newsletter, and 
    will receive a `configurationId` in response to call this newsletter configuration.
1.  A publisher will fetch a valid prompt using the `configurationId`, and then display it.
1.  When configuring the prompt display code, a publisher will provide a callback
    that will be used to store the responses from the newsletter signup, and 
    acknowledge to Google that the email address has been saved.

## Configure Prompts

During the manual configuration beta of the Newsletter feature of RRM:E, publishers must
provide a manual configuration for each newsletter that they would like configured. The
configuration for each newsletter will determine which features are displayed in the
prompt, and what data is passed to the publisher for each subscriber.

### Prompt Configuration Examples

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

### Provide Prompt Configuration to Google

Configurations for newsletters may include the following fields.

- **Publication Id** (as found in the Publisher Center configuration for the RRM:E publication)
- **Newsletter title** _(text)_ - The title of the newsletter, which appears below the name
- **Newsletter body** _(text)_ - A description of the newsletter
- **Show a permission checkbox?** _(true/false)_ - A checkbox to determine if additional acceptance should be required of the newsletter subscriber
- **Permission description** _(text)_ _optional_- A label for the permission checkbox. Required if showing a permission checkbox is required.

!!! caution **NOTE:** `publicationId` and `name` are **required**, but all other fields are optional.
!!!

In response, Google will provide a `configurationId` for each newsletter. 


#### Configuration for the sample prompts

This page includes two newsletter configurations. They were created with the following configuration:

```json
[
  {
    publicationId: 'CAow3fzXCw',
    title: 'Subscriber Newsletter',
    body: 'As a premium benefit, enjoy curated subscriber news'
  },
  {
    publicationId: 'CAow3fzXCw',
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

### Invoke Newsletter Prompts

To configure newsletter prompts, `swg.js` must first be configured on the page.
These examples show using the initialization of the library in `manual` mode, but the
APIs are also available in automatic mode. 

### Get the prompt instance to display

To invoke a newsletter prompt, a publisher must use the `configurationId` provided by
Google in response to submitting a prompt configuration. Publishers use the
`configurationId` to fetch a valid prompt instance using the `subscriptions.getAvailableInterventions()` method from the initialized `swg.js` library.

```javascript
const publisherConfiguration = {
  name: 'Subscriber Newsletter',
  configurationId: '49c12712-9750-4571-8c67-96722561c13a',
};

const availableInterventions = await subscriptions.getAvailableInterventions();

const prompt = availableInterventions.find(({configurationId}) => {
    return configurationId === publisherConfiguration.configurationId;
});
```

### Show the prompt

To display a prompt, use the returned value from `subscriptions.getAvailableInterventions()` and use the `show` method:

```javascript
prompt?.show({
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
to create the prompt, as well as the newsletter subscriber's information. The `configurationId` matches the `configurationId provided to the publisher from Google, in response to the per-newsletter configuration authored by the publisher in the initial step.

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
2. When the library is ready, use the `newsletter-1234` configurationId to request a prompt to display.  
3. When the button is clicked, display the prompt.
4. Store the results of a successful prompt with the sample `NewsletterPersistence()` library.

!!! note `NewsletterPersistence()` is an example implementation.
In a production environment, a publisher would use the prompt response to send data to their own
account or customer management system. 
!!!

```html
<!-- manual swg.js initialization -->
<script async
    subscriptions-control="manual"
    type="application/javascript"
    src="https://news.google.com/swg/js/v1/swg.js">
</script>

<!-- configuring swg.js to invoke and handle newsletter prompts -->
<script type="module">

// Example library for storing email signups
import {NewsletterPersistence} from './newsletter-persistence.js';
const newsletterCache = new NewsletterPersistence();

const newsletterConfigurations = [
  {
    name: 'Subscriber Newsletter',
    configurationId: '49c12712-9750-4571-8c67-96722561c13a',
  },
  {
    name: 'Breaking News',
    configurationId: 'e98a2efb-d009-43c9-99ef-dda11c8c5a7f',
  },
];

const buttonContainer = document.querySelector('#newsletterPrompts');

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  subscriptions.configure({paySwgVersion: '2'});
  subscriptions.init('CAow3fzXCw');

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

  for (const newsletterConfiguration of newsletterConfigurations) {
    const buttonEnabledState = availableInterventionConfigurationIds.includes(
      newsletterConfiguration.configurationId
    );

    createButtonForPrompt(
      availableInterventions,
      newsletterConfiguration,
      buttonEnabledState,
      buttonContainer
    );
  }
});


<!--  The following helper functions are not required, 
      but help to provide a clear syntax in the above example. -->


// Helper function for returning a specific prompt (if available) from all interventions
async function getPrompt(availableInterventions, specifiedConfigurationId) {
  return availableInterventions.find(({configurationId}) => {
    return configurationId === specifiedConfigurationId;
  });
}

// Launch a given prompt
async function launchSpecificPrompt(prompt) {
  prompt?.show({
    isClosable: true,
    onResult: (result) => {
      console.log(result);
      newsletterCache.signup(result);
    },
  });
}

// Helper function for creating a button to launch a prompt
async function createButtonForPrompt(
  availableInterventions,
  newsletterConfiguration,
  buttonEnabledState,
  container
) {
  const button = document.createElement('button');
  const prompt = await getPrompt(
    availableInterventions,
    newsletterConfiguration.configurationId
  );

  if (buttonEnabledState == true) {
    button.onclick = () => {
      launchSpecificPrompt(prompt);
    };
  } else {
    button.setAttribute('disabled', 'true');
  }

  button.textContent = `${buttonEnabledState == false ? '✅' : ''} ${newsletterConfiguration.name}`;
  container.appendChild(button);
}

</script>
```