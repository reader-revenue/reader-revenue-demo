# Custom CTAs (ESM)

This page both demonstrates how RRM:E custom CTAs work using ES Modules, as well as documents how to implement them.

## Test the manual custom CTA invocation

<div id="ctas"></div>

## Custom CTA Overview

### Invoke Custom CTAs

```javascript
// 1. Import SwG
import { subscriptions } from "{{env.SWG_JS_MJS_URL}}";

// 2. Wait for the runtime to be ready
await subscriptions.ready();

// 3. Initialize SwG
subscriptions.init('{{env.PUBLICATION_ID}}');

// 4. Fetch the available interventions
const availableInterventions = await subscriptions.getAvailableInterventions();

// 5. Find custom CTAs
const filteredInterventions = availableInterventions.filter(
    (intervention) => intervention.type === 'TYPE_BYO_CTA'
);
```
