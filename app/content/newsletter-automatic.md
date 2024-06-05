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
(self.SWG = self.SWG || []).push(async (subscriptions) => {
  // Configure the events logger
  const eventManager = await subscriptions.getEventManager();
  eventManager.registerEventListener(console.log);

  // Get all available interventions
  const availableInterventions =
    await subscriptions.getAvailableInterventions();

  console.log({availableInterventions});

  // Return the prompt, if available, for the current configurationId
  const prompt = availableInterventions.find(({intervention}) => {
    return intervention.configurationId === configurationId;
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