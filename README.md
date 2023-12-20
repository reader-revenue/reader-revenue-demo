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


### Deploy

To deploy this application to the beta appspot service:

```shell
gcloud app deploy beta.yaml
```

To deploy this application to the prod appspot service (with optional `--quiet`
flag to expedite the deploy):

```shell
gcloud app deploy app.yaml --quiet
```

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
