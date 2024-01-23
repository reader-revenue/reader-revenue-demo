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
-   `SERVICE_ACCOUNT` - Specify a service account for server-side access
-   `SERVICE_NAME` - The name of the deployed instance in App Engine

See Google Cloud Build's help on [substitution variable values](https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values)
for more information.

## Working with this application

This application is designed to allow content edits to happen with ease, but
allow enough flexibility to accommodate significant deviations from the
templated methods.

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
```

## Next Steps

-   For the complete list of `reader-revenue-manager` apis, please see the
    [site's interactive demos](https://reader-revenue-demo.ue.r.appspot.com/).
-   For more information on working with this application, please see the
    complete editing instructions in the
    [contributing instructions](https://reader-revenue-demo.ue.r.appspot.com/contributing).
