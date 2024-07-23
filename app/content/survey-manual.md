<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg{{#env.SWG_OVERRIDE}}-{{.}}{{/env.SWG_OVERRIDE}}.js">
</script>


# Survey prompts

This page both demonstrates how RRM:E survey sign-up works, as well as documents
how to implement the prompts.

## Test the manual survey invocation

<div id="prompts"></div>

## Survey Prompt Overview

A publisher can configure one or more surveys for manual invocation by using an
initialized `swg.js` instance. In order to use this feature:

1.  The publisher will create a survey in the Publisher Center content access section 
    for their publication.
1.  The publisher will fetch a valid prompt using the `configurationId`, and then 
    display it.
1.  When configuring the prompt display code, a publisher will provide a callback
    that will be used to store the responses from the newsletter signup, and 
    acknowledge to Google that the email address has been saved.


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

### Invoke Survey Prompts

To configure survey prompts, `swg.js` must first be configured on the page.
These examples show using the initialization of the library in `manual` mode, but the
APIs are also available in automatic mode. 

### Get the prompt instance to display

To invoke a survey prompt, a publisher must use the `configurationId` from the Publisher
Center survey configuration page. Publishers use the `configurationId` to fetch a valid 
prompt instance using the `subscriptions.getAvailableInterventions()` method from 
the initialized `swg.js` library.

```javascript
const publisherConfiguration = {
  name: 'Basic survey',
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
to create the prompt, as well as the newsletter subscriber's information. The `configurationId` matches the `configurationId provided to the publisher from Google, in response to the configuration authored by the publisher in the initial step.

!!! note `onResult()` callback conforms to the documented type in [github](https://github.com/subscriptions-project/swg-js/blob/main/src/api/available-intervention.ts#L41).
The contents of a prompt determines the shape of the `onResult` callback data.
For example, a single-page survey response will differ in shape from a multi-page survey.
For best results, store the entire result.
!!!

#### Complete Example

This complete example accomplishes the following:

1. Initializes `swg.js` library in manual mode.
2. When the library is ready, use the `49c12712-9750-4571-8c67-96722561c13a` configurationId to request a prompt to display.  
3. When the button is clicked, display the prompt.
4. Store the results of a successful prompt with the sample `PromptPersistence()` library.

!!! note `PromptPersistence()` is an example implementation.
In a production environment, a publisher would use the prompt response to send data to the publisher's customer management system or equivalent. 
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
import {PromptPersistence} from './prompt-persistence.js';
const promptCache = new PromptPersistence();

const promptConfigurations = [
  {
    name: 'Basic survey',
    configurationId: '49c12712-9750-4571-8c67-96722561c13a',
  },
  {
    name: 'Multi-page survey',
    configurationId: 'e98a2efb-d009-43c9-99ef-dda11c8c5a7f',
  },
];

const buttonContainer = document.querySelector('#prompts');

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

  for (const promptConfiguration of promptConfigurations) {
    const buttonEnabledState = availableInterventionConfigurationIds.includes(
      promptConfiguration.configurationId
    );

    createButtonForPrompt(
      availableInterventions,
      promptConfiguration,
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
      promptcacheCache.record(result);
    },
  });
}

// Helper function for creating a button to launch a prompt
async function createButtonForPrompt(
  availableInterventions,
  promptConfiguration,
  buttonEnabledState,
  container
) {
  const button = document.createElement('button');
  const prompt = await getPrompt(
    availableInterventions,
    promptConfiguration.configurationId
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