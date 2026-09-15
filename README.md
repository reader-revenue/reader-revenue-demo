# Reader Revenue Demo app

### An application that illustrates client- and server-side APIs for Reader Revenue

---

> [!NOTE] 
> This application can be previewed on the live
> [reader-revenue-demo](https://reader-revenue-demo.ue.r.appspot.com/) site.

## Installation and usage

### Install

`npm install`

### Run

`npm run local`

> [!IMPORTANT]
> When running locally, this application uses an `.env` file. Please see the
> [section on working with this application](#working-with-this-application) for
> more details.


### Deploy manually

To deploy this application to the prod appspot service (with optional `--quiet`
flag to expedite the deploy):

```shell
gcloud app deploy app.yaml --quiet
```
> [!IMPORTANT]
> When deploying, this app uses many environmental variables defined in the `app.yaml`
> file. By default, they are filled in with placeholders. Before deploying, you will
> need to enter the appropriate variables into your copy of the `app.yaml` file.


### Deploy with Google Cloud Build

This project is configured with a `cloudbuild.yaml` file for use with Google
Cloud Build. If configured with a Cloud Build Trigger, the following variable
substitutions can occur at build-time:

-   `ENV_NAME` - Appears in the header of the site.
-   `ENV_OVERRIDES` - Allows for some env vars to be overridden by query params. See
    [middleware/overrides.js](https://github.com/reader-revenue/reader-revenue-demo/blob/main/middleware/overrides.js)
    for more information.
-   `GOOGLE_CLOUD_REGION` - E.g. `us-east1`, for use with Pub/Sub and other region-
    specific APIs.
-   `GOOGLE_SITE_VERIFICATION` - For use with validating in Search Console.
-   `OAUTH_CLIENT_ID` - Useful for authorized js origins
-   `OAUTH_CLIENT_SECRET` - Useful for authenticated api calls
-   `PUBLICATION_ID` - Used in client- and server-side code
-   `PUBLICATION_ID_SL_BUNDLE` - Used in the demo for bundling Subscription Linking as an additional publication to link, in addition to `PUBLICATION_ID`.
-   `SERVICE_ACCOUNT` - Specify a service account for server-side access
-   `SERVICE_NAME` - The name of the deployed instance in App Engine
-   `CTA_CONFIG` - CTA configuration object. Used in cta-methods.js.
-   `CTA_CONFIG_BASE64` - Base64-encoded version of CTA_CONFIG.
-   `NEWSLETTER_CTA_CONFIGURATION_ID` - Used in newsletter-automatic.js
-   `SWG_SKU` - Used in add-swg-button.js
-   `OTHER_SKU1` - Used in update-sku.js as an initial subscription SKU
-   `OTHER_SKU2` - Used in update-sku.js as an upgrade/downgrade target SKU
-   `OTHER_SKU3` - Used in update-sku.js as an upgrade/downgrade target SKU
-   `GTAG_PROPERTY_ID` - A unique id to send data to Google Analytics and/or Google Ads. It's also called [Google ID](https://support.google.com/analytics/answer/9539598).
-   `GTAG_CONSENT_MODE_ALL_DENIED` - Set [default consent status](https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced#default-consent) to all denied
-   `GTAG_DEBUG_MODE` - Enable [gtag debug mode](https://support.google.com/analytics/answer/7201382#zippy=%2Cgoogle-tag-gtagjs)


See Google Cloud Build's help on [substitution variable values](https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values)
for more information.

## Working with this application

This application is designed to allow content edits to happen with ease, but
allow enough flexibility to accommodate significant deviations from the
templated methods.

### Local swg-js development

You can test this demo application against custom or locally compiled `swg-js` binaries by leveraging environment variable URL overrides without creating filesystem symlinks across project boundaries.

#### 1. Serve your local swg-js build
Start a local static HTTP server (with CORS headers enabled for ES Modules) inside your `swg-js` build output directory on a dedicated port (for example, `http://localhost:8000`).

#### 2. Configure environment overrides
In your `.env` file (or directly in your terminal execution environment), override the target script URLs:
```shell
SWG_PUBLISHER_URL=http://localhost:8000/dist/publisher.js
SWG_PUBLISHER_MJS_URL=http://localhost:8000/dist/publisher.mjs
```
You can similarly override `SWG_URL`, `SWG_GAA_URL`, and `SWG_BASIC_URL` as needed for other library bundles.

#### 3. Run the demo
Start the demo server as usual:

```shell
npm run local
```

The application will dynamically resolve and serve your custom endpoints across all interactive demo pages!

### Local SSL Proxy & Domain Interception

When testing features that enforce strict origin verification (`window.location.origin`), such as Google Sign-In OAuth or `swg.js`, you can enable the built-in forward SSL proxy to intercept an authorized production domain (e.g., `https://reader-revenue-demo.ue.r.appspot.com`) and route it locally to Express (`127.0.0.1:8080`).

See [app/content/ssl-proxy.md](./app/content/ssl-proxy.md) (or visit `/ssl-proxy` when running locally) for full setup instructions.

### Sample Env File

```shell
# General node.js env vars
PORT=8080 #port to run on
NODE_ENV=development
ENV_NAME=local #Give your instance a distinct name that surfaces in the header

# Settings for configuring behind a reverse proxy
PROXY_URL=local.domain
HOST=0.0.0.0
DISABLE_SSL=true

# Settings for signed cookies
COOKIE_SECRET=secret

# GCP-specific env vars for external service communication
GOOGLE_CLOUD_REGION=us-east1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/application_default_credentials.json

# Publication configuration
PUBLICATION_ID=publisher-center-ppid.google.com
OAUTH_CLIENT_ID=abcd-1234.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=secret-abc-1234
GOOGLE_SITE_VERIFICATION=public-abc-1234

# CTA configuration
CTA_CONFIG=""
CTA_CONFIG_BASE64="eyJUWVBFX05FV1NMRVRURVJfU0lHTlVQIjpbeyJuYW1lIjoiTmV3c2xldHRlcl9TaWdudXAiLCJjb25maWd1cmF0aW9uSWQiOiI4YmViZGU3NS0wN2U0LTRjYmMtODExNy03ODU0MzVhMzA4NDgifSx7Im5hbWUiOiJCcmVha2luX05ld3MiLCJjb25maWd1cmF0aW9uSWQiOiJkN2M1MmMxOC1kY2NhLTRjYTMtYjRkZi0wMjJjNTU3YjA2YjgifV0sIlRZUEVfUkVXQVJERURfU1VSVkVZIjpbeyJuYW1lIjoiTXVsdGlwbGVfUXVlc3Rpb25zIiwiY29uZmlndXJhdGlvbklkIjoiZWY2ZGVmNDMtMjU2NS00ZTViLWFkMDYtODBlYmVjYWE3MTVlIn0seyJuYW1lIjoiU2luZ2xlX1F1ZXN0aW9uIiwiY29uZmlndXJhdGlvbklkIjoiMDdmZWZlODMtOGFhOS00OGVjLWExNzItZmYwNTIyMjA5Y2Y0In1dfQ"
NEWSLETTER_CTA_CONFIGURATION_ID=newsletter-config-1234

# SwG configuration
SWG_SKU=SWGPD.1234
OTHER_SKU1=SWGPD.7396-1992-3713-93389
OTHER_SKU2=SWGPD.3391-5185-7663-76625
OTHER_SKU3=SWGPD.1622-6200-3088-81282

# Google Analytics
GTAG_PROPERTY_ID=G-12345ABCDE
GTAG_CONSENT_MODE_ALL_DENIED=true
GTAG_DEBUG_MODE=true

# SSL Proxy Configuration (Opt-In)
SSL_PROXY_ENABLED=false
SSL_PROXY_PORT=8888
SSL_TARGET_DOMAIN=reader-revenue-demo.ue.r.appspot.com
SSL_CERTS_DIR=.certs
```

## Next Steps

-   For the complete list of `reader-revenue-manager` apis, please see the
    [site's interactive demos](https://reader-revenue-demo.ue.r.appspot.com/).
-   For more information on working with this application, please see the
    complete editing instructions in the
    [contributing instructions](https://reader-revenue-demo.ue.r.appspot.com/contributing).
