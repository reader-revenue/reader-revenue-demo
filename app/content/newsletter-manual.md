<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Newsletter prompts
## Test the manual newsletter invocation

<button id="prompt">Prompt the newsletter sign-up</button>

## Newsletter Prompt Overview

A publisher can configure one or more newsletters for manual invocation by using an
initialized `swg.js` instance. In order to use this feature:

1.  A publisher will provide Google with a prompt configuration per newsletter, and 
    will receive a `promptId` in response to call this newsletter configuration.
1.  A publisher will fetch a valid prompt using the `promptId`, and then display it.
1.  When configuring the prompt display code, a publisher will provide a callback
    that will be used to store the responses from the newsletter signup, and 
    acknowledge to Google that the email address has been saved.

!!! caution JavaScript API is **in progress**
As the newsletter feature is currently in alpha, the following API exposed by
`swg.js` should be considered as being in draft, and not the final implementation. 
!!!

## Configure Prompts

### Provide Prompt Configuration to Google

During the manual configuration beta of the Newsletter feature of RRM:E, publishers must
provide a manual configuration for each newsletter that they would like configured.

- **Publication Id** (as found in the Publisher Center configuration for the RRM:E publication)
- **Newsletter name** _(text)_ - The name of the newsletter
- **Newsletter description** _(text)_ - A description of the newsletter
- **Show a permission checkbox?** _(true/false)_ - A checkbox to determine if additional acceptance should be required of the newsletter subscriber
- **Permission** _(text)_ _optional_- A label for the permission checkbox. Required if showing a permission checkbox is required.

In response, Google will provide a `promptId` for each newsletter. 

### Invoke Newsletter Prompts

To configure newsletter prompts, `swg.js` must first be configured on the page.
These examples show using the initialization of the library in `manual` mode, but the
APIs are also available in automatic mode. 

### Get the prompt instance to display

To invoke a newsletter prompt, a publisher must use the `promptId` provided by
Google in response to submitting a prompt configuration. Publishers use the
`promptId` to fetch a valid prompt instance using the `subscriptions.getAvailableInterventions()` method from the initialized `swg.js` library.

```javascript
const newsletterId = '<id returend after submitting a newsletter config>';

const availableInterventions = await subscriptions.getAvailableInterventions();

const prompt = availableInterventions.find(({id}) => {
    return id === newsletterId;
});
```

### Show the prompt, and handle the response

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

#### Complete Example

```html
<!-- manual swg.js initialization -->
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

        const promptId = `newsletterId`;
        const button = document.querySelector('#prompt');

        button.onclick = async () => {
            let promptInstanceId = await getPrompt(promptId);
            await launchPrompt(promptInstanceId);
        }
    });

    async function getPrompt(newsletterId) {
        const availableInterventions = await subscriptions.getAvailableInterventions();

        return availableInterventions.find(({id}) => {
            return id === newsletterId;
        });
    }

    async function launchPrompt(promptId) {
        const prompt = await getPrompt(promptId);
        prompt?.show({
            isClosable: true,
            onResult: (result) => {
                newsletter.email = result;
                return true;
            }
        });
    }
</script>
```