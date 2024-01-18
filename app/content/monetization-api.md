<script src="https://accounts.google.com/gsi/client"></script>


# Manually query member and order details with the Monetization API

Publishers can use the Monetization API to find out more information about members
and orders using the Monetization API. Unlike the [Publication API](/reference/publication-api),
the Monetization API uses service accounts for server-to-server authentication,
rather than user-scoped `access_token` authentication.

!!! info **Service Account Setup**
For more information on creating and configuring Service Accounts, please see the
[Subscription Linking Service Account Setup](https://developers.google.com/news/subscribe/subscription-linking/implementation/server-side#create_a_service_account) devsite article.
!!!

#### Interactive buttons

<div id="readerIdForm"></div>

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
    <tr id="entitlementsPlans">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Publication API's <code>entitlementsPlans</code> endpoint to query the full detail of an entitlement for a logged-in user.</p>
      </td>
    </tr>
    <tr id="member">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Publication API to query information on any <code>reader_id</code>. Note: does not require an <code>access_token</code>.</p>
      </td>
    </tr>
    <tr id="order">
      <td>
        <div class="button"></div>
      </td>
      <td>
        <p>Use the Publication API to query order information for a particular <code>reader_id</code>
        for a particular <code>plan_id</code>.</p>
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
