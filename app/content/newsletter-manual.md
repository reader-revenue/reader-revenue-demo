<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Newsletter prompts
## Test the manual newsletter invocation

!!! note Prompt testing is currently disabled
!!!
<button id="prompt" disabled>Prompt the newsletter sign-up</button>

## Newsletter Prompt Overview

A publisher can configure one or more newsletters for manual invocation by using an
initialized `swg.js` instance. In order to use this feature:

1.  A publisher will provide Google with a prompt configuration per newsletter, and 
    will receive a `configurationId` in response to call this newsletter configuration.
1.  A publisher will fetch a valid prompt using the `configurationId`, and then display it.
1.  When configuring the prompt display code, a publisher will provide a callback
    that will be used to store the responses from the newsletter signup, and 
    acknowledge to Google that the email address has been saved.

!!! caution JavaScript API is **in progress**
As the newsletter feature is currently in alpha, the following API exposed by
`swg.js` should be considered as being in draft, and not the final implementation. 
!!!

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

### Invoke Newsletter Prompts

To configure newsletter prompts, `swg.js` must first be configured on the page.
These examples show using the initialization of the library in `manual` mode, but the
APIs are also available in automatic mode. 

### Get the prompt instance to display

To invoke a newsletter prompt, a publisher must use the `configurationId` provided by
Google in response to submitting a prompt configuration. Publishers use the
`configurationId` to fetch a valid prompt instance using the `subscriptions.getAvailableInterventions()` method from the initialized `swg.js` library.

```javascript
const configurationId = '<id returend after submitting a newsletter config>';

const availableInterventions = await subscriptions.getAvailableInterventions();

const prompt = availableInterventions.find(({intervention}) => {
    return intervention.configurationId === configurationId;
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
<!-- 1. manual swg.js initialization -->
<script async
    subscriptions-control="manual"
    type="application/javascript"
    src="https://news.google.com/swg/js/v1/swg.js">
</script>

<!-- configuring swg.js to invoke and handle newsletter prompts -->
<script type="module">
    import { NewsletterPersistence } from 'js/newsletter-persistence.js';
    const newsletterPersistence = new NewsletterPersistence();

    (self.SWG = self.SWG || []).push( subscriptions => {
        subscriptions.configure({paySwgVersion: '2'});
        subscriptions.init('CAowqfCKCw');

        //2. Use newsletter-1234 as the configurationId
        const configurationId = `newsletter-1234`;
        const button = document.querySelector('#prompt');

        button.onclick = async () => {
            let promptInstanceId = await getPrompt(configurationId, subscriptions);

            //3. Display the requested prompt
            await launchPrompt(promptInstanceId);
        }
    });

    //Accepts a configurationId, and returns a new prompt instance with matching configurationId
    async function getPrompt(configurationId, subscriptions) {
        const availableInterventions = await subscriptions.getAvailableInterventions();

        return availableInterventions.find(({id}) => {
            return id === configurationId;
        });
    }

    //Displays the prompt, and handles the user data from the response
    async function launchPrompt(configurationId) {
        const prompt = await getPrompt(configurationId);
        prompt?.show({
            isClosable: true,
            onResult: (result) => {
                //4. Handle the user data response
                const {userEmail} = result.data;
                newsletter.signup({configurationId, userEmail});
                return true;
            }
        });
    }
</script>
```