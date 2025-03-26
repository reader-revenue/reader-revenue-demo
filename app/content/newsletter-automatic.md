<script async
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Newsletter Automatic Initialization

`swg.js` can be initialized automaticaly or manually. 
The following is an example of how to automatically initialize the
javascript library, as well as launch the CTA without user 
intervention, if there is an available CTA for the current user.


```javascript
// Example library for storing email signups
import {NewsletterPersistence} from './newsletter-persistence.js';
const newsletterCache = new NewsletterPersistence();

// Sample newsletter configuration created by the publisher
const publisherConfiguration = {
  name: 'Subscriber Newsletter',
  configurationId: '8bebde75-07e4-4cbc-8117-785435a30848',
};

(self.SWG = self.SWG || []).push(async (subscriptions) => {
  // Configure the events logger
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);

  // Get all available interventions
  const availableInterventions =
    await subscriptions.getAvailableInterventions();

  console.log({availableInterventions});

  // Return the CTA, if available, for the current configurationId
  const cta = availableInterventions.find(({configurationId}) => {
    return configurationId === publisherConfiguration.configurationId;
  });

  // Show the CTA, if available
  cta?.show({
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