<script async
  subscriptions-control="manual"
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>
<script src="https://accounts.google.com/gsi/client"></script>

# Update subscription (Upgrade/Downgrade)

To upgrade or downgrade a subscription, you first need to identify the user's current active subscription. This can be done using the **Publication API**.

## 1. Check Eligibility (Publication API)

Sign in with Google to retrieve your current entitlements. If an active subscription is found, the update buttons below will be enabled.

<table>
  <thead>
    <tr>
      <th>
        Button
      </th>
      <th>
        Details
      </th>
    </tr>
  </thead>
  <tbody>
    <tr id="siwgButton">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Sign-in with Google button to check your active subscriptions.</p>
      </td>
    </tr>
  </tbody>
</table>

<div id="eligibility-status" class="alert alert-info mt-3">Please sign in to check your eligibility for an update.</div>

## 2. Upgrade/Downgrade Flows

### showUpdateOffers()

The `showUpdateOffers()` method displays an offers carousel specifically for existing subscribers. It requires an `oldSku` parameter to identify the subscription being replaced.

In this demo, we'll use your current active SKU (retrieved above) as the `oldSku` and offer `{{env.OTHER_SKU2}}` and `{{env.OTHER_SKU3}}` as alternatives.

<button id="swg-update-offers-button" class="demo-button" disabled>Show Update Offers</button>

### updateSubscription()

The `updateSubscription()` method initiates a direct purchase flow for a new SKU, replacing an existing one. It also requires an `oldSku`.

In this demo, we'll trigger an update from your current SKU to `{{env.OTHER_SKU2}}`.

<button id="swg-update-subscription-button" class="demo-button" disabled>Update Subscription Directly</button>

## Implementation

### showUpdateOffers

1. Identify the user's current SKU (e.g., from `getEntitlements()`).
2. Call `showUpdateOffers()` with the current SKU as `oldSku` and a list of available `skus` to upgrade/downgrade to.

```javascript
subscriptions.showUpdateOffers({
  oldSku: '{{env.OTHER_SKU1}}',
  skus: ['{{env.OTHER_SKU2}}', '{{env.OTHER_SKU3}}'],
  isClosable: true
});
```

### updateSubscription

If you want to trigger a specific upgrade/downgrade directly (e.g., from a custom button), use `updateSubscription()`.

```javascript
subscriptions.updateSubscription({
  skuId: '{{env.OTHER_SKU2}}',
  oldSku: '{{env.OTHER_SKU1}}'
});
```

### Proration Modes

By default, SwG uses `IMMEDIATE_WITH_TIME_PRORATION`. You can explicitly set this in the `SubscriptionRequest`.

```javascript
subscriptions.updateSubscription({
  skuId: 'new_sku_id',
  oldSku: 'current_sku_id',
  replaceSkuProrationMode: 'IMMEDIATE_WITH_TIME_PRORATION'
});
```
