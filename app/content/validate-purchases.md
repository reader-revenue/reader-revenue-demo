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
    "raw": "{\"signedEntitlements\":\"eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg3MGUzMzVmZmQxOTkwNzA4YTc4ZTVhMzQyODQzODBmOGQyNWUyMzgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL3JlYWRlci1yZXZlbnVlLWRlbW8udWUuci5hcHBzcG90LmNvbSIsImV4cCI6MTcxOTQzNDAwNCwiaWF0IjoxNzE5NDMyMjA0LCJpc3MiOiJzdWJzY3JpYmV3aXRoZ29vZ2xlQHN5c3RlbS5nc2VydmljZWFjY291bnQuY29tIiwiZW50aXRsZW1lbnRzIjpbeyJzb3VyY2UiOiJnb29nbGU6c3Vic2NyaWJlciIsInByb2R1Y3RzIjpbIkNBb3dxZkNLQ3c6YmFzaWMiLCJDQW93cWZDS0N3Om9wZW5hY2Nlc3MiXSwic3Vic2NyaXB0aW9uVG9rZW4iOiJ7XCJhdXRvUmVuZXdpbmdcIjpmYWxzZSxcIm9yZGVySWRcIjpcIlNXRy45OTczLTE2NTQtNzY4OC0zMDExNlwiLFwicHJvZHVjdElkXCI6XCJTV0dQRC43OTc1LTYwODQtMDU3Ny0xMjE3OFwiLFwicHVyY2hhc2VUaW1lXCI6MTcxODczMDU3ODA0OSxcIndhaXRpbmdUb0NhbmNlbFwiOnRydWUsXCJmaXhSZXF1aXJlZFwiOmZhbHNlfSIsInJlYWRlcklkIjoiNGRmMGZhZjI2NjMwYTU2MzI5YTEzN2NjYmZjNWQ0NjQifSx7InNvdXJjZSI6Imdvb2dsZTpzdWJzY3JpYmVyIiwicHJvZHVjdHMiOlsiQ0Fvd3FmQ0tDdzpiYXNpYyIsIkNBb3dxZkNLQ3c6b3BlbmFjY2VzcyJdLCJzdWJzY3JpcHRpb25Ub2tlbiI6IntcImF1dG9SZW5ld2luZ1wiOnRydWUsXCJvcmRlcklkXCI6XCJTV0cuNjM5OC0wODQ1LTg0MzMtNjk3MTFcIixcInByb2R1Y3RJZFwiOlwiU1dHUEQuMTM2NC0zOTY5LTQ4MDMtNTE3MTlcIixcInB1cmNoYXNlVGltZVwiOjE3MTk0MzIyMDMzNDYsXCJ3YWl0aW5nVG9DYW5jZWxcIjpmYWxzZSxcImZpeFJlcXVpcmVkXCI6ZmFsc2V9IiwicmVhZGVySWQiOiI0ZGYwZmFmMjY2MzBhNTYzMjlhMTM3Y2NiZmM1ZDQ2NCJ9XX0.RPXV86EEQf9DMDkHHwoK6O9_DyN-tbGPJq4H6XB39zFADjZZNhFDKAZJGL-SxmmxpT_TjGwVQbqog9fomEZJm7NP7Z5HOdBo-jrufl_g9aP9p9PIIV5T1JcsNJdDvKzgOix8gcwWb22js2OICeWRrJtA_vWlcB0jCGwigy9HjaG0NctNPb1J1jTFAv3Tqw06IRsDCFvEaef2g9hqsOh44jA34DBAt_bKHYDpR2I9SpY3s64idvKxrxuyPylkc6FY-KRvBLaNdi4GFd6AcznilkgsxoDP_PFbgPWv3of1eQ8t-SY8KQwTI-mxfMAZK-y2zMwlaOElOBkkovVdQXEAeg\",\"swgUserToken\":\"AamD4uSfHFB2EIc4m+hsQT1t1imgM45PiEYqp81GIZ9iYXDNb3e1likH8NYfKs7q6NkBP9N1zE5pYk+mwRlMbxELFicudfeDgOymDY+3bXenTw==\",\"purchaseData\":\"{\\\"autoRenewing\\\":true,\\\"orderId\\\":\\\"SWG.6398-0845-8433-69711\\\",\\\"productId\\\":\\\"SWGPD.1364-3969-4803-51719\\\",\\\"purchaseTime\\\":1719432203346,\\\"waitingToCancel\\\":false,\\\"fixRequired\\\":false}\"}",
    "purchaseData": {
        "raw": "{\"autoRenewing\":true,\"orderId\":\"SWG.6398-0845-8433-69711\",\"productId\":\"SWGPD.1364-3969-4803-51719\",\"purchaseTime\":1719432203346,\"waitingToCancel\":false,\"fixRequired\":false}",
        "data": "{\"autoRenewing\":true,\"orderId\":\"SWG.6398-0845-8433-69711\",\"productId\":\"SWGPD.1364-3969-4803-51719\",\"purchaseTime\":1719432203346,\"waitingToCancel\":false,\"fixRequired\":false}"
    },
    "userData": null,
    "entitlements": {
        "service": "subscribe.google.com",
        "raw": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg3MGUzMzVmZmQxOTkwNzA4YTc4ZTVhMzQyODQzODBmOGQyNWUyMzgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL3JlYWRlci1yZXZlbnVlLWRlbW8udWUuci5hcHBzcG90LmNvbSIsImV4cCI6MTcxOTQzNDAwNCwiaWF0IjoxNzE5NDMyMjA0LCJpc3MiOiJzdWJzY3JpYmV3aXRoZ29vZ2xlQHN5c3RlbS5nc2VydmljZWFjY291bnQuY29tIiwiZW50aXRsZW1lbnRzIjpbeyJzb3VyY2UiOiJnb29nbGU6c3Vic2NyaWJlciIsInByb2R1Y3RzIjpbIkNBb3dxZkNLQ3c6YmFzaWMiLCJDQW93cWZDS0N3Om9wZW5hY2Nlc3MiXSwic3Vic2NyaXB0aW9uVG9rZW4iOiJ7XCJhdXRvUmVuZXdpbmdcIjpmYWxzZSxcIm9yZGVySWRcIjpcIlNXRy45OTczLTE2NTQtNzY4OC0zMDExNlwiLFwicHJvZHVjdElkXCI6XCJTV0dQRC43OTc1LTYwODQtMDU3Ny0xMjE3OFwiLFwicHVyY2hhc2VUaW1lXCI6MTcxODczMDU3ODA0OSxcIndhaXRpbmdUb0NhbmNlbFwiOnRydWUsXCJmaXhSZXF1aXJlZFwiOmZhbHNlfSIsInJlYWRlcklkIjoiNGRmMGZhZjI2NjMwYTU2MzI5YTEzN2NjYmZjNWQ0NjQifSx7InNvdXJjZSI6Imdvb2dsZTpzdWJzY3JpYmVyIiwicHJvZHVjdHMiOlsiQ0Fvd3FmQ0tDdzpiYXNpYyIsIkNBb3dxZkNLQ3c6b3BlbmFjY2VzcyJdLCJzdWJzY3JpcHRpb25Ub2tlbiI6IntcImF1dG9SZW5ld2luZ1wiOnRydWUsXCJvcmRlcklkXCI6XCJTV0cuNjM5OC0wODQ1LTg0MzMtNjk3MTFcIixcInByb2R1Y3RJZFwiOlwiU1dHUEQuMTM2NC0zOTY5LTQ4MDMtNTE3MTlcIixcInB1cmNoYXNlVGltZVwiOjE3MTk0MzIyMDMzNDYsXCJ3YWl0aW5nVG9DYW5jZWxcIjpmYWxzZSxcImZpeFJlcXVpcmVkXCI6ZmFsc2V9IiwicmVhZGVySWQiOiI0ZGYwZmFmMjY2MzBhNTYzMjlhMTM3Y2NiZmM1ZDQ2NCJ9XX0.RPXV86EEQf9DMDkHHwoK6O9_DyN-tbGPJq4H6XB39zFADjZZNhFDKAZJGL-SxmmxpT_TjGwVQbqog9fomEZJm7NP7Z5HOdBo-jrufl_g9aP9p9PIIV5T1JcsNJdDvKzgOix8gcwWb22js2OICeWRrJtA_vWlcB0jCGwigy9HjaG0NctNPb1J1jTFAv3Tqw06IRsDCFvEaef2g9hqsOh44jA34DBAt_bKHYDpR2I9SpY3s64idvKxrxuyPylkc6FY-KRvBLaNdi4GFd6AcznilkgsxoDP_PFbgPWv3of1eQ8t-SY8KQwTI-mxfMAZK-y2zMwlaOElOBkkovVdQXEAeg",
        "entitlements": [
            {
                "source": "google:subscriber",
                "products": [
                    "CAowqfCKCw:basic",
                    "CAowqfCKCw:openaccess"
                ],
                "subscriptionToken": "{\"autoRenewing\":false,\"orderId\":\"SWG.9973-1654-7688-30116\",\"productId\":\"SWGPD.7975-6084-0577-12178\",\"purchaseTime\":1718730578049,\"waitingToCancel\":true,\"fixRequired\":false}",
                "subscriptionTokenContents": null,
                "subscriptionTimestamp": null,
                "readerId": "4df0faf26630a56329a137ccbfc5d464"
            },
            {
                "source": "google:subscriber",
                "products": [
                    "CAowqfCKCw:basic",
                    "CAowqfCKCw:openaccess"
                ],
                "subscriptionToken": "{\"autoRenewing\":true,\"orderId\":\"SWG.6398-0845-8433-69711\",\"productId\":\"SWGPD.1364-3969-4803-51719\",\"purchaseTime\":1719432203346,\"waitingToCancel\":false,\"fixRequired\":false}",
                "subscriptionTokenContents": null,
                "subscriptionTimestamp": null,
                "readerId": "4df0faf26630a56329a137ccbfc5d464"
            }
        ],
        "En": null,
        "decryptedDocumentKey": null,
        "isReadyToPay": false
    },
    "productType": "SUBSCRIPTION",
    "oldSku": null,
    "swgUserToken": "AamD4uSfHFB2EIc4m+hsQT1t1imgM45PiEYqp81GIZ9iYXDNb3e1likH8NYfKs7q6NkBP9N1zE5pYk+mwRlMbxELFicudfeDgOymDY+3bXenTw==",
    "paymentRecurrence": null,
    "requestMetadata": null
}
```