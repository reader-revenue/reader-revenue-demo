<script src="https://accounts.google.com/gsi/client"></script>


# Manually check for entitlements with the Publication API

!!! hint **Using Google Identity Services**
This example page uses the Google Identity Services (GIS) OAuth Client and the Reader Revenue Manager: Enterprise (RRM:E) Publication API to retrieve user entitlements.
!!!

Publishers are required to use the Publication API right after Sign In With Google in order to retrieve user's entitlements from Google to perform deferred account creation or logging in of the linked account. The Publication API takes in two parameters: the `publicationId` and an `accessToken`.

*   The `publicationId` is defined for your publication in Publisher Center.
*   The `accessToken` is obtained using the OAuth flow, which we implement here using the GIS SDK.

Note that it is critical that the [OAuth 2.0 Authorization code flow](https://www.ietf.org/rfc/rfc6749.txt) standard is implemented, as this flow provides you with a refresh token, and thereby lets you query the Publication API without having to repeatedly prompt the user for consent to get a new `accessToken`. In this flow, the user's consent is materialized by an Authorization code which you can swap for an `accessToken` and a `refreshToken` (see [here ](https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse)for specific documentation).

As an alternative to the GIS' SIWG button, you can use the [GIS' One Tap user experience](https://developers.google.com/identity/gsi/web/guides/features) by calling `google.accounts.id.prompt()` instead of `google.accounts.id.renderButton()`.

!!! caution **Scope requirements for `accessToken` usage**
When generating an `accessToken`, it is important to request the correct scopes for
the intended use. With the Publication API, you **must** use `https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.readonly`, and can **optionally** use `https://www.googleapis.com/auth/userinfo.email` to fetch addtional user profile information. Please see the article [Get an Access Token with Necessary Scopes](https://developers.google.com/news/reader-revenue/monetization/sell/check-for-entitlements?#access_token) for more details.
!!!

## Demo: GIS Authenticate / Authorize + RRM:E Publication API

Click on the Sign in with Google button below to authenticate. Doing so uses the Authorization Code flow, and gives this demo application an Authorization Code that it exchanges for an `accessToken` in order to call the Publication API. Once it has completed the exchange, your entitlements will be displayed in the console below. 

If you don't have a subscription to the publication that this demo application is configured with, you will be seeing and empty bracket: `{}` (see the [Publication API reference](https://developers.google.com/news/reader-revenue/monetization/reference/publication-api?#entitlements) for a mock entitlement response). You can purchase a subscription by using the buyflow from the [Add Subscribe with Google button](/swg/add-button) article, or push entitlements to your linked account with the [Subscription Linking](/subscription-linking/client-side) article. 

#### Sign-in with Google and Interactive buttons

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
        <p>Sign-in with Google button that is personalized on repeat use.</p>
      </td>
    </tr>
    <tr id="accessToken" class="hidden">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Publication API's <code>entitlements</code> endpoint with the logged-in user's <code>accessToken</code>.</p>
      </td>
    </tr>
    <tr id="entitlementsPlans" class="hidden">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Publication API's <code>entitlementsPlans</code> endpoint to query the full detail of an entitlement for a logged-in user.</p>
      </td>
    </tr>
    <tr id="member" class="hidden">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Publication API to query information on any <code>reader_id</code>. Note: does not require an <code>access_token</code>.</p>
      </td>
    </tr>
    <tr id="order" class="hidden">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Publication API to query order information for a particular <code>reader_id</code>
        for a particular <code>plan_id</code>.</p>
      </td>
    </tr>    
    <tr id="refreshButton" class="hidden">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the <code>refreshToken</code> to generate a new <code>accessToken<code>.</p>
      </td>
    </tr>
    <tr id="revokeButton" class="hidden">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Revoke the current <code>accessToken</code> and log out the current user.</p>
      </td>
    </tr>
  </tbody>
</table>

<div id="GISOutput"></div>



### Entitlements Response

Access tokens periodically expire but you can [obtain new ones using the Refresh Token ](https://developers.google.com/identity/protocols/oauth2/web-server#offline)without prompting the user for permission (including when the user is not present). As a returning user, you will see above the Refresh Token which was stored. When you click again on Sign in with Google, the corresponding Access Token is used but no new Authorization code is needed.


# Implementation Samples

While most of the logic for using the Publication API can be done client-side,
certain aspects of the OAuth flow must be done server-side. The following code
samples are split across the client and server, illustrating the type of logic
that should happen at each layer.

## Client-side code sample

We suggest instantiatiating this flow by calling the GIS SDK's `google.accounts.oauth2.initCodeClient` function in the callback of the Sign in with Google button.


```html
  <head>
    <script>

      // Exchange authorization code for access+refresh tokens
      async function exchangeAuthCodeForTokens(authorizationCode) {
        let url = "https://oauth2.googleapis.com/token?client_id=" + YOUR_OAUTH_CLIENT_ID + "&client_secret=" + YOUR_OAUTH_CLIENT_SECRET + "&code=" + authorizationCode + "&grant_type=authorization_code&redirect_uri=" + REDIRECT_URL
        var requestOptions = {method: 'POST', redirect: 'follow'};
        return fetch(url, requestOptions)
          .then(response => response.json())
          .catch(error => console.log('error', error));
      }

      function initGISAuthCodeClientRedirect(hint) { // GIS Authorization client
        const REQUESTED_SCOPES = [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/subscribewithgoogle.publications.entitlements.readonly'
        ].join(' ');

        return google.accounts.oauth2.initCodeClient({
          client_id: YOUR_OAUTH_CLIENT_ID,
          scope: REQUESTED_SCOPES,
          hint: hint,
          ux_mode: 'redirect',
          redirect_uri: REDIRECT_URL, // Add to list of allowed redirects in Cloud Console
          state: 'redirect_from_gis_authz_client',
          select_account: false
        });
      }

      function process_entitlements(entitlements) {
        // TODO: Publisher implemented function that stores and processes
        // newly retreived subscriber entitlements
      }

      // Initialise the GIS Authentication client
      google.accounts.id.initialize({
        client_id: YOUR_OAUTH_CLIENT_ID,
        callback: (response) => {
          let user_identifier = parseJwt(response.credential).sub
          let valid_access_token_in_db = getAccessTokenFromStorage(user_identifier)
          if (valid_access_token_in_db) { // Case 1: known user with valid token
            queryPublicationAPI(publication_id, valid_access_token_in_db)
              .then(entitlements => process_entitlements(entitlements))
          } else { // Case 2: no creds, initialise the GIS Authorization client
            let auth_client = initGISAuthCodeClientRedirect(hint=user_identifier)
            auth_client.requestCode() // initiate a redirect flow
          }
        }
      });

      // google.accounts.id.prompt() // For pages without a login button, use One Tap
      google.accounts.id.renderButton(
        document.getElementById("siwgButton"),
        { theme: "outline", size: "large" }  // customization attributes
      );

      // Handle redirect from OAuth endpoint
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('state') === "redirect_from_gis_authz_client") {
        exchangeAuthCodeForTokens(urlParams.get('code')).then(tokens => {
          saveTokensInStorage(user_identifier, tokens.access_token, tokens.refresh_token)
          return queryPublicationAPI(publicationId, tokens.access_token)
        }).then(entitlements => process_entitlements(entitlements))
      }

     </script>
  </head>

  <body><div id="siwgButton" ></div></body>
```

## Server-side code sample

Read about how to [manually check for entitlements](https://developers.google.com/news/reader-revenue/monetization/sell/check-for-entitlements) with the Publication API, and its [api documentation](https://developers.google.com/news/reader-revenue/monetization/reference/publication-api).
