# Validate Purchases

## Test payment validation

Paste a `paymentResponse` object from the `setOnPaymentResponse` handler to be validated:

<div id="paymentResponse"></div>


## How to validate a purchase

1.  Receive `purchaseData` from a `setOnPaymentResponse` callback. See [Add a Subscribe with Google button](/swg/add-button) for a live example. 
1.  Use a copy of the latest [X.509 certs](https://www.googleapis.com/robot/v1/metadata/x509/subscribewithgoogle@system.gserviceaccount.com). For reference, these are linked from the [Validate entitlements entry for `swg.js`](https://github.com/subscriptions-project/swg-js/blob/main/docs/entitlements-flow.md#validate-entitlements) on GitHub.
1. Base64 decode the `signedEntitlements` from the `raw` section of the `purchaseData`, and use the `kid` value to determine which certificate was used in the signing of the entitlement. 
1. Use a library, for example [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken), to validate the token with the appropriate certificate.

## Purchase Validation Walkthrough

An example client-side script that processes the paymentResponse:

```javascript

//example payments response from a setOnPaymentResponse callback
const paymentResponse = {
    'raw': {
        'signedEntitlements':'eyJhbGciOiJSUzI1NiIsImtpZCI6I...'
    }
    ...
}

//get the kid to determine which certificate to use
const {signedEntitlements} = JSON.parse(paymentResponse.raw);
const {kid} = parseJwtHeader(signedEntitlements);

//fetch the certificates, and select the one indiciated by the kid
const certUrl =
  'https://www.googleapis.com/robot/v1/metadata/x509/subscribewithgoogle@system.gserviceaccount.com';
const certificates = await fetch(certUrl).then((r) => r.json());
const certificate = certificates[kid];

//send the payload to a trusted endpoint to perform validation
const validationResult = await fetch('/api/validate-purchases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({
      certificate,
      signedEntitlements: entitlementsToSend,
    },
  }).then((r) => r.json());
```

An example server-side node.js express router that receives the POST request:

```javascript
import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';

const {verify} = jwt;

const router = express.Router();

router.post('/', bodyParser.json(), (req, res) => {
  console.log(req.body);
  try {
    const {signedEntitlements, certificate} = req.body;
    const validCert = certificate.replaceAll('\r', '\r\n');

    const output = verify(signedEntitlements, validCert, {
      ignoreExpiration: true,
    });
    res.json(output);
  } catch (e) {
    res.status(500).json({
      error: 'validation',
      message: 'unable to validate',
    });
  }
});
```

A helper function for parsing the jwt header more easily:
```javascript
//helper function to parse the jwt header
function parseJwtHeader(token) {
  const base64Url = token.split('.')[0];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

```

## Sample payload

```javascript
{
    "raw": "{\"signedEntitlements\":\"eyJhbGciOiJSUzI1NiIsImtpZCI6IjMwYzNiODg3ZjY4OGFjYzUxOTc1M2UzMzU5YmJjZTYxZDhmOWMwYTkiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL3JlYWRlci1yZXZlbnVlLWRlbW8udWUuci5hcHBzcG90LmNvbSIsImV4cCI6MTcyMDc2ODk5NywiaWF0IjoxNzIwNzY3MTk3LCJpc3MiOiJzdWJzY3JpYmV3aXRoZ29vZ2xlQHN5c3RlbS5nc2VydmljZWFjY291bnQuY29tIiwiZW50aXRsZW1lbnRzIjpbeyJzb3VyY2UiOiJnb29nbGU6c3Vic2NyaWJlciIsInByb2R1Y3RzIjpbIkNBb3dxZkNLQ3c6YmFzaWMiLCJDQW93cWZDS0N3Om9wZW5hY2Nlc3MiXSwic3Vic2NyaXB0aW9uVG9rZW4iOiJ7XCJhdXRvUmVuZXdpbmdcIjp0cnVlLFwib3JkZXJJZFwiOlwiU1dHLjE4OTMtMjkwNS0xMzI1LTk2NDE1XCIsXCJwcm9kdWN0SWRcIjpcIlNXR1BELjEzNjQtMzk2OS00ODAzLTUxNzE5XCIsXCJwdXJjaGFzZVRpbWVcIjoxNzIwNzY3MTk2OTIzLFwid2FpdGluZ1RvQ2FuY2VsXCI6ZmFsc2UsXCJmaXhSZXF1aXJlZFwiOmZhbHNlfSIsInJlYWRlcklkIjoiM2YwMDZhYTE5YWM3MzdkNDIxMDljMmFjZGQ0NmQzNmUifV19.AG3GCdn58x3QPbYlUknmJbE2r7AY0ZiKO4cxiGwR4GWlvGuLKkko7IVepKaq7aK2CkOGCXxKg7EcOcHzddbqupNLTabkDCp3pausC8I_1b0To5M8ARit2cwjl3DFe4O4ILAs-2DVQAebZdZLLwUTLn7umFVG4WKRMq0ZdmOSEET4K0w-Kqj8JDQoSCMUWaGZaAwFCSvE-lLsVaYQn07DcelEjl_9_HxKfjt86d1r_c5T3fXpKJQxkFBv0i4DRf_yCJpuB6ioaTBb5aImOI8WjIkykARfmBVvkqtkCKgHD7Mpdi327DUdHgv7A48HewwcH8RgvJz67s4ai8dFqVMxGA\",\"swgUserToken\":\"AdAFvZ1eSdlex3u9KkIX32eOHa6qUwkYVUXkAXyampk41jViJ0wGZd5arCp9RUpO0znC5lNI6naHMU9y4H1PZBpxRSCgv0uNBtTu3IrONDqZ/Q==\",\"purchaseData\":\"{\\\"autoRenewing\\\":true,\\\"orderId\\\":\\\"SWG.1893-2905-1325-96415\\\",\\\"productId\\\":\\\"SWGPD.1364-3969-4803-51719\\\",\\\"purchaseTime\\\":1720767196923,\\\"waitingToCancel\\\":false,\\\"fixRequired\\\":false}\"}",
    "purchaseData": {
        "raw": "{\"autoRenewing\":true,\"orderId\":\"SWG.1893-2905-1325-96415\",\"productId\":\"SWGPD.1364-3969-4803-51719\",\"purchaseTime\":1720767196923,\"waitingToCancel\":false,\"fixRequired\":false}",
        "data": "{\"autoRenewing\":true,\"orderId\":\"SWG.1893-2905-1325-96415\",\"productId\":\"SWGPD.1364-3969-4803-51719\",\"purchaseTime\":1720767196923,\"waitingToCancel\":false,\"fixRequired\":false}"
    },
    "userData": null,
    "entitlements": {
        "service": "subscribe.google.com",
        "raw": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjMwYzNiODg3ZjY4OGFjYzUxOTc1M2UzMzU5YmJjZTYxZDhmOWMwYTkiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL3JlYWRlci1yZXZlbnVlLWRlbW8udWUuci5hcHBzcG90LmNvbSIsImV4cCI6MTcyMDc2ODk5NywiaWF0IjoxNzIwNzY3MTk3LCJpc3MiOiJzdWJzY3JpYmV3aXRoZ29vZ2xlQHN5c3RlbS5nc2VydmljZWFjY291bnQuY29tIiwiZW50aXRsZW1lbnRzIjpbeyJzb3VyY2UiOiJnb29nbGU6c3Vic2NyaWJlciIsInByb2R1Y3RzIjpbIkNBb3dxZkNLQ3c6YmFzaWMiLCJDQW93cWZDS0N3Om9wZW5hY2Nlc3MiXSwic3Vic2NyaXB0aW9uVG9rZW4iOiJ7XCJhdXRvUmVuZXdpbmdcIjp0cnVlLFwib3JkZXJJZFwiOlwiU1dHLjE4OTMtMjkwNS0xMzI1LTk2NDE1XCIsXCJwcm9kdWN0SWRcIjpcIlNXR1BELjEzNjQtMzk2OS00ODAzLTUxNzE5XCIsXCJwdXJjaGFzZVRpbWVcIjoxNzIwNzY3MTk2OTIzLFwid2FpdGluZ1RvQ2FuY2VsXCI6ZmFsc2UsXCJmaXhSZXF1aXJlZFwiOmZhbHNlfSIsInJlYWRlcklkIjoiM2YwMDZhYTE5YWM3MzdkNDIxMDljMmFjZGQ0NmQzNmUifV19.AG3GCdn58x3QPbYlUknmJbE2r7AY0ZiKO4cxiGwR4GWlvGuLKkko7IVepKaq7aK2CkOGCXxKg7EcOcHzddbqupNLTabkDCp3pausC8I_1b0To5M8ARit2cwjl3DFe4O4ILAs-2DVQAebZdZLLwUTLn7umFVG4WKRMq0ZdmOSEET4K0w-Kqj8JDQoSCMUWaGZaAwFCSvE-lLsVaYQn07DcelEjl_9_HxKfjt86d1r_c5T3fXpKJQxkFBv0i4DRf_yCJpuB6ioaTBb5aImOI8WjIkykARfmBVvkqtkCKgHD7Mpdi327DUdHgv7A48HewwcH8RgvJz67s4ai8dFqVMxGA",
        "entitlements": [
            {
                "source": "google:subscriber",
                "products": [
                    "CAowqfCKCw:basic",
                    "CAowqfCKCw:openaccess"
                ],
                "subscriptionToken": "{\"autoRenewing\":true,\"orderId\":\"SWG.1893-2905-1325-96415\",\"productId\":\"SWGPD.1364-3969-4803-51719\",\"purchaseTime\":1720767196923,\"waitingToCancel\":false,\"fixRequired\":false}",
                "subscriptionTokenContents": null,
                "subscriptionTimestamp": null,
                "readerId": "3f006aa19ac737d42109c2acdd46d36e"
            }
        ],
        "En": null,
        "decryptedDocumentKey": null,
        "isReadyToPay": false
    },
    "productType": "SUBSCRIPTION",
    "oldSku": null,
    "swgUserToken": "AdAFvZ1eSdlex3u9KkIX32eOHa6qUwkYVUXkAXyampk41jViJ0wGZd5arCp9RUpO0znC5lNI6naHMU9y4H1PZBpxRSCgv0uNBtTu3IrONDqZ/Q==",
    "paymentRecurrence": null,
    "requestMetadata": null
}
```
