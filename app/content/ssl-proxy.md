# Local SSL Proxy & Domain Interception Guide

### Intercepting an authorized production domain for local development

---

## 1. Motivation & Problem Statement

* **Authorized JavaScript Origins**: Google Sign-In OAuth and `swg.js` (the Reader Revenue Manager client library) enforce strict origin verification (`window.location.origin`). When testing against production OAuth client IDs where adding ad-hoc `localhost` or custom origins in the Google Cloud Console is not possible, the client application must run on an already authorized origin (e.g., `https://reader-revenue-demo.ue.r.appspot.com`).
* **The Solution**: An opt-in forward HTTP/HTTPS proxy on port `8888` that intercepts HTTPS requests targeting `reader-revenue-demo.ue.r.appspot.com:443`, terminates TLS dynamically with a locally generated certificate, and reverse-proxies the decrypted HTTP request to the local Express app on port `8080`.
* **Passthrough**: All other outbound domains (Google OAuth, Google Cloud APIs, CDNs, etc.) are blind-tunneled via raw TCP without TLS inspection.

---

## 2. Architecture & Components

### A. Certificate Manager (`lib/certs.js`)
* Zero external dependencies (uses standard `node:crypto`, `node:fs`, and `openssl` with configuration templates in `lib/templates/`).
* Automatically generates and manages local certificates in `.certs/` (configurable via `SSL_CERTS_DIR`).
* Employs X.509 `nameConstraints` (`permitted;DNS:reader-revenue-demo.ue.r.appspot.com`) so the local CA cannot be used outside the configured target domain scope.
* Dynamically mints and caches leaf certificates with Subject Alternative Names (SAN) matching the requested domain during TLS SNI negotiation.

### B. SSL Stream Proxy (`lib/ssl-stream-proxy.js` & `middleware/ssl-proxy.js`)
* Opt-in via `SSL_PROXY_ENABLED=true`.
* Listens on `0.0.0.0:8888` (configurable via `SSL_PROXY_PORT`).
* Spawns an internal HTTPS server on an ephemeral loopback port (`127.0.0.1:0`) using dynamic SNI certificates from `CertificateManager`.
* Exposes direct HTTP utility endpoints on port `8888`:
  * `GET http://127.0.0.1:8888/health`: Returns proxy status JSON.
  * `GET http://127.0.0.1:8888/ca.crt`: Serves the Root CA public certificate.
  * `GET http://127.0.0.1:8888/proxy.pac`: Serves a dynamic Proxy Auto-Config (PAC) script.
* Intercepts HTTP `CONNECT` tunnels:
  * **Target Host (`reader-revenue-demo.ue.r.appspot.com:443`)**: Routed to the internal HTTPS server, which terminates TLS, sets forwarding headers (`Host`, `X-Forwarded-Proto: https`, `X-Forwarded-Host`), and forwards requests to Express (`127.0.0.1:8080`).
  * **All Other Hosts**: Blind raw TCP tunneling via `net.connect(targetPort, targetHost)` piped directly between client and upstream socket.

---

## 3. Environment Configuration (`.env`)

Enable and configure the proxy by adding the following variables to your `.env` file:

```shell
PORT=8080
HOST=0.0.0.0
ENV_NAME=local
PUBLICATION_ID=publisher-center-ppid.google.com
GOOGLE_APPLICATION_CREDENTIALS=/path/to/application_default_credentials.json

# SSL Proxy Configuration (Opt-In)
SSL_PROXY_ENABLED=true
SSL_PROXY_PORT=8888
SSL_TARGET_DOMAIN=reader-revenue-demo.ue.r.appspot.com
SSL_CERTS_DIR=.certs
```

---

## 4. Running the Application

1. Start the server (requires Node.js v24+):
   ```shell
   npm run local
   ```

2. Verify proxy health:
   ```shell
   curl -s http://127.0.0.1:8888/health
   # Expected: {"status":"ok","proxyPort":8888,"targetDomains":["reader-revenue-demo.ue.r.appspot.com"],"appPort":8080}
   ```

3. Verify local HTTPS interception via curl:
   ```shell
   curl -k -x http://127.0.0.1:8888 https://reader-revenue-demo.ue.r.appspot.com/
   ```

---

## 5. Configuring Google Chrome

To keep setup as simple as possible without modifying your operating system's certificate keychain, quit any running instances of Chrome and launch it with `--proxy-server` and `--ignore-certificate-errors`:

### Linux
```shell
google-chrome \
  --proxy-server="http://127.0.0.1:8888" \
  --ignore-certificate-errors \
  https://reader-revenue-demo.ue.r.appspot.com/
```

### macOS
```shell
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --proxy-server="http://127.0.0.1:8888" \
  --ignore-certificate-errors \
  https://reader-revenue-demo.ue.r.appspot.com/
```

!!! hint **Running Chrome in parallel (`--user-data-dir`)**
If Chrome is already running, launching it from the terminal will open a new tab in your existing browser process and silently ignore command-line flags like `--proxy-server` and `--ignore-certificate-errors`.

If you want to run a proxied instance of Chrome in parallel to your existing one without closing your open windows, pass `--user-data-dir="/tmp/chrome-dev-proxy"` to launch an isolated browser profile.
!!!

!!! note **Browser Proxy Extensions**
If you use browser extensions that manage proxy settings (such as PAC or VPN extensions), ensure they are disabled so they do not override the `--proxy-server` command-line flag.
!!!
