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

import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';

const {verify} = jwt;

const router = express.Router();

router.post('/', bodyParser.json(), (req, res) => {
  console.log(req.body);
  const {signedEntitlements, certificate} = req.body;
  try {
    const validCert = certificate.replaceAll('\r', '\r\n');

    const output = verify(signedEntitlements, validCert, {
      ignoreExpiration: false,
    });
    res.json(output);
  } catch (e) {
    console.log("Error with the first attempt - ", e);
    try {
      const validCachedCert = cachedCertificate.replaceAll('\r', '\r\n');
      const output = verify(signedEntitlements, validCachedCert, {
         // set it to true because this fallback reattempt means a public cert rotation has happend  
         // = the default example entitlement is most likely expired
        ignoreExpiration: true,
      });
      console.log("success with the second attempt with the cached certificate.",);
      res.json(output);  
      } catch (e){
        console.log(e);
        res.status(500).json({
          error: 'validation',
          message: 'unable to validate',
        });
      } 
  }
});

/** 
 * {type} @string
 * - retrieved and cached on 2024-07-12 at https://www.googleapis.com/robot/v1/metadata/x509/subscribewithgoogle@system.gserviceaccount.com 
 * - to reattempt with kid "30c3b887f688acc519753e3359bbce61d8f9c0a9" after a public certificate rotation 
*/
const cachedCertificate = "-----BEGIN CERTIFICATE-----\n\
MIIDLTCCAhWgAwIBAgIJAL0sdaamKUUNMA0GCSqGSIb3DQEBBQUAMDkxNzA1BgNV\n\
BAMMLnN1YnNjcmliZXdpdGhnb29nbGUuc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5j\n\
b20wHhcNMjQwNjI5MTcwOTEwWhcNMjQwNzE2MDUyNDEwWjA5MTcwNQYDVQQDDC5z\n\
dWJzY3JpYmV3aXRoZ29vZ2xlLnN5c3RlbS5nc2VydmljZWFjY291bnQuY29tMIIB\n\
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvKr7iHeJIVaScARnFty0bnr4\n\
rx1DQHxZM72SulXDUmvH9YFgeKGfKh/vzH8CMjAJTegX4+37YOG+VCkbbBGdMPp1\n\
/DeZ+pY4syabCxCtFhilfWrjCf8qAAFP+7bm7o1qf8HPzhuiASmtgo/wNpi7u+gu\n\
VmYkravSQCDcVzhqLtOMcSKe3xeeLalwfxkE/k6Pb8OMoczPS3/XRgrGQEl/OeSR\n\
1FpghbONlrYDoUoTTF7ziQHxdCB450mF7w3FqmgX4bGgyxQQgJIcKnKUoOuE1qIE\n\
y5xFvT/UWZ9aIKx2I9XItkDZQZzmFxc5Nep/k8VFRhsIU14Xpyhhr4Tf4BPHkQID\n\
AQABozgwNjAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIHgDAWBgNVHSUBAf8E\n\
DDAKBggrBgEFBQcDAjANBgkqhkiG9w0BAQUFAAOCAQEASEFqrwOCudwKYNC9O4dy\n\
KrE4A7VIyOm7m8Zy84No9moT3kNHWzguFxOGS0rHUkVsZGjE3shLHNRkzixd06jD\n\
ESem4rRcaxyq/7Fn/AN2dHeC+t08kMbTA1P+Hl5LZ7YKBImuvlZD1Eb3dSupO3s/\n\
j8emJ71CXVItMeVCvEHafC901VvDGL/jQbafXdG2ZFTcrhA0txlmlZOir0W3hZnf\n\
ZZoPgIC5X3dAZX/6WgOxyt3ILNPJzJTcP/HbHXq2Ul0L5r9fMjAahjueKMqUNF+c\n\
3B8mKLHVOXnuMZXvJ7zQKkoBMyLww1qE8CQ0qskTQFoQLZYExqivg+W8ZZwB2P3G\n\
8Q==\n\
-----END CERTIFICATE-----";

export default router;
