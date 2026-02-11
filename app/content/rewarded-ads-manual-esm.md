# Rewarded Ads CTAs (ESM)

This page both demonstrates how RRM:E rewarded ads work using ES Modules, as well as documents how to implement the CTAs.

## Test the manual rewarded ads invocation

<div id="ctas"></div>

## Rewarded Ads CTA Overview

### Invoke Rewarded Ads CTAs

```javascript
// 1. Import SwG
import { subscriptions } from "{{env.SWG_JS_MJS_URL}}";

// 2. Wait for the runtime to be ready
await subscriptions.ready();

// 3. Initialize SwG
subscriptions.init('{{env.PUBLICATION_ID}}');

// 4. Fetch the available interventions
const availableInterventions = await subscriptions.getAvailableInterventions();

// 5. Find rewarded ads CTAs
const filteredInterventions = availableInterventions.filter(
    (intervention) => intervention.type === 'TYPE_REWARDED_AD'
);
```
