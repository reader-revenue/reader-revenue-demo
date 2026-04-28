import {initializeClient} from './publication-api-google-client.js';
import {renderButton} from './publication-api-buttons.js';
import {exchangeAuthCodeForTokens, queryLocalEntitlements} from './publication-api-entitlements.js';
import {hasAuthzCred, getAuthzCred, setAuthzCreds} from './publication-api-storage.js';

console.log('update-sku.js script loaded');

let activeSku = null;

function updateEligibilityUI(sku) {
  const statusEl = document.getElementById('eligibility-status');
  const updateOffersButton = document.getElementById('swg-update-offers-button');
  const updateSubscriptionButton = document.getElementById('swg-update-subscription-button');

  if (sku) {
    activeSku = sku;
    statusEl.className = 'alert alert-success mt-3';
    statusEl.innerText = `Eligible to update! Current SKU: ${sku}`;
    if (updateOffersButton) updateOffersButton.disabled = false;
    if (updateSubscriptionButton) updateSubscriptionButton.disabled = false;
  } else {
    activeSku = null;
    statusEl.className = 'alert alert-warning mt-3';
    statusEl.innerText = 'No active subscription found. You must have a subscription to test the update flow.';
    if (updateOffersButton) updateOffersButton.disabled = true;
    if (updateSubscriptionButton) updateSubscriptionButton.disabled = true;
  }
}

async function checkEntitlements() {
  if (hasAuthzCred('accessToken')) {
    try {
      const result = await queryLocalEntitlements(getAuthzCred('accessToken'));
      if (result.entitlements && result.entitlements.length > 0) {
        // Find the most recent entitlement
        const mostRecent = result.entitlements[0];
        
        // The SKU ID (e.g. SWGPD.xxx) is often inside the subscriptionToken string
        let skuId = mostRecent.productId;
        if (!skuId && mostRecent.subscriptionToken) {
          try {
            const tokenData = JSON.parse(mostRecent.subscriptionToken);
            skuId = tokenData.productId;
          } catch (e) {
            console.warn('Failed to parse subscriptionToken', e);
          }
        }

        updateEligibilityUI(skuId);
      } else {
        updateEligibilityUI(null);
      }
    } catch (e) {
      console.error('Error checking entitlements:', e);
      updateEligibilityUI(null);
    }
  }
}

/**
 * handleRedirectFromOAuth (custom version for this page)
 */
async function handleRedirect(authorization_code, redirectUri) {
  console.log('Redirect from OAuth endpoint (custom)');
  const tokens = await exchangeAuthCodeForTokens(authorization_code, redirectUri);
  setAuthzCreds(authorization_code, tokens.access_token, tokens.refresh_token);
  // Redirect back to this page without the OAuth params
  window.location.href = window.location.pathname;
}

function analyticsEventLogger(subs) {
  subs.getEventManager().then(manager => {
    manager.registerEventListener((event) => {
      console.log('New analytics event: ', event);
    });
  });
}

(self.SWG = self.SWG || []).push(async subscriptions => {
  console.log('SwG update-sku.js callback executed');
  const paySwgVersion = 'process.env.PAY_SWG_VERSION' == '1' ? '1' : '2'

  if (paySwgVersion == '2') {
    subscriptions.configure({paySwgVersion: '2'});
  }
  subscriptions.init('process.env.PUBLICATION_ID');

  analyticsEventLogger(subscriptions);

  // Initialize GIS
  const redirectUri = `${location.origin}${location.pathname}`;
  initializeClient(redirectUri);
  renderButton('#siwgButton .button');

  // handle redirect
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('state') === 'redirect_from_gis_authz_client') {
    await handleRedirect(urlParams.get('code'), redirectUri);
  }

  // Check for cached credentials
  if (hasAuthzCred('refreshToken')) {
    await checkEntitlements();
  }

  // Button for showUpdateOffers
  let updateOffersButton = document.getElementById('swg-update-offers-button');
  console.log('updateOffersButton found:', !!updateOffersButton);
  if (updateOffersButton) {
    updateOffersButton.onclick = function() {
      console.log('showUpdateOffers button clicked with oldSku:', activeSku);
      subscriptions.showUpdateOffers({
        oldSku: activeSku,
        skus: ['process.env.OTHER_SKU2', 'process.env.OTHER_SKU3'],
        isClosable: true
      });
    };
  }

  // Button for updateSubscription
  let updateSubscriptionButton = document.getElementById('swg-update-subscription-button');
  console.log('updateSubscriptionButton found:', !!updateSubscriptionButton);
  if (updateSubscriptionButton) {
    updateSubscriptionButton.onclick = function() {
      console.log('updateSubscription button clicked from oldSku:', activeSku);
      subscriptions.updateSubscription({
        skuId: 'process.env.OTHER_SKU2',
        oldSku: activeSku
      });
    };
  }

  subscriptions.setOnPaymentResponse(async (paymentResponse) => {
    let response = await paymentResponse;
    console.log('paymentResponse :', response);
    await response.complete();
    const entitlements = await subscriptions.getEntitlements();
    console.log('Entitlements from setOnPaymentsResponse', entitlements);
    // Refresh entitlements after successful update
    await checkEntitlements();
  });
});
