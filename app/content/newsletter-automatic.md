<script async
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Newsletter Automatic Initialization

`swg.js` can be initialized automaticaly or manually. 
The following is an example of how to automatically initialize the
javascript library, as well as launch the prompt without user 
intervention, if there is an available prompt for the current user.


```javascript
// Example library for storing email signups
import {NewsletterPersistence} from './newsletter-persistence.js';
const newsletterCache = new NewsletterPersistence();

// Sample newsletter configuration created by the publisher
const publisherConfiguration = {
  name: 'Subscriber Newsletter',
  configurationId: '49c12712-9750-4571-8c67-96722561c13a',
};

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  // Configure the events logger
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);

  // Get all available interventions
  const availableInterventions =
    await subscriptions.getAvailableInterventions();

  console.log({availableInterventions});

  // Return the prompt, if available, for the current configurationId
  const prompt = availableInterventions.find(({configurationId}) => {
    return configurationId === publisherConfiguration.configurationId;
  });

  // Show the prompt, if available
  prompt?.show({
    isClosable: true,
    onResult: (result) => {
      console.log(result);
      newsletterCache.signup(result);

      // Acknowledge that the email has been handled by the publisher
      return true;
    },
  });
});
```