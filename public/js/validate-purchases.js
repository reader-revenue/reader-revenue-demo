/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {insertHighlightedJson, parseJwtHeader} from './utils.js';

const paymentResponse = {
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
};

const {signedEntitlements} = JSON.parse(paymentResponse.raw);
const {kid} = parseJwtHeader(signedEntitlements);

const certUrl =
  'https://www.googleapis.com/robot/v1/metadata/x509/subscribewithgoogle@system.gserviceaccount.com';

const certificates = await fetch(certUrl).then((r) => r.json());

const certificate = certificates[kid];

const container = document.querySelector('#paymentResponse');

const paymentResponseEntry = document.createElement('textarea');
paymentResponseEntry.value = JSON.stringify(paymentResponse);
paymentResponseEntry.style = 'width:500px; height:300px;';
container.appendChild(paymentResponseEntry);

const validateButton = document.createElement('button');
validateButton.innerText = 'Validate';
validateButton.onclick = async () => {
  const entitlementsToSend = JSON.parse(
    JSON.parse(paymentResponseEntry.value).raw
  ).signedEntitlements;

  const body = JSON.stringify({
    certificate,
    signedEntitlements: entitlementsToSend,
  });

  const validationResult = await fetch('/api/validate-purchases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }).then((r) => r.json());

  console.log(validationResult);
  insertHighlightedJson(
    '#paymentResponse',
    validationResult,
    'Validation Result'
  );
};
container.appendChild(validateButton);
