<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

<script>
    import {Storage} from '../../lib/datastore.js';

    (self.SWG = self.SWG || []).push( subscriptions => {
        subscriptions.configure({paySwgVersion: '2'});
        subscriptions.init('CAowqfCKCw');


        let promptId = `<pre-defined id>`
        const button = document.querySelector('#prompt');

        button.onclick = async () => {
            const prompt = await getPrompt(promptId);
            prompt?.show({
                isClosable: true,
                onResult: (result) => {

                }
            })
        }
    });

    async function getPrompt(promptId) {
        const availableInterventions = await subscriptions.getAvailableInterventions();

        return availableInterventions.find(({id}) => {
            return id === `<pre-defined string>`;
        });
    }
</script>

# Newsletter prompts
## Manual invocation

<button id="prompt">Prompt the newsletter sign-up</button>