/**
 * Copyright 2026 Google LLC
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

import {jest} from '@jest/globals';

describe('verifyPubSubToken middleware', () => {
  let verifyPubSubToken;
  let mockVerifyIdToken;

  beforeEach(async () => {
    jest.resetModules();
    delete process.env.SKIP_PUBSUB_AUTH;
    delete process.env.PUBSUB_VERIFICATION_AUDIENCE;

    mockVerifyIdToken = jest.fn();

    // Mock OAuth2Client
    jest.unstable_mockModule('google-auth-library', () => ({
      OAuth2Client: jest.fn().mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
      })),
    }));

    const module = await import('../middleware/pub-sub.js');
    verifyPubSubToken = module.verifyPubSubToken;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should reject request when Authorization header is missing', async () => {
    const req = {headers: {}};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await verifyPubSubToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      'Unauthorized: Missing or invalid Authorization header'
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request when Authorization header is not Bearer', async () => {
    const req = {headers: {authorization: 'Basic 12345'}};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await verifyPubSubToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      'Unauthorized: Missing or invalid Authorization header'
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request when token is empty after Bearer prefix', async () => {
    const req = {headers: {authorization: 'Bearer   '}};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await verifyPubSubToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Unauthorized: Empty Bearer token');
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request when verifyIdToken throws an error (e.g. forged signature or expired)', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token signature'));

    const req = {headers: {authorization: 'Bearer fake-invalid-jwt'}};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await verifyPubSubToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      'Unauthorized: Token verification failed (Invalid token signature)'
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request when token issuer is not Google Accounts', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: 'https://evil-attacker.com',
        aud: 'https://example.com/api/pub-sub/receive',
      }),
    });

    const req = {headers: {authorization: 'Bearer attacker-signed-jwt'}};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await verifyPubSubToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Unauthorized: Invalid token issuer');
    expect(next).not.toHaveBeenCalled();
  });

  test('should accept request and call next() when Google-signed token is valid', async () => {
    const validPayload = {
      iss: 'https://accounts.google.com',
      aud: 'https://demo.appspot.com/api/pub-sub/receive',
      email: 'service-account@project.iam.gserviceaccount.com',
    };
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => validPayload,
    });

    const req = {headers: {authorization: 'Bearer valid-google-jwt'}};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await verifyPubSubToken(req, res, next);

    expect(req.pubsubTokenPayload).toEqual(validPayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should bypass verification when SKIP_PUBSUB_AUTH is true', async () => {
    process.env.SKIP_PUBSUB_AUTH = 'true';

    const req = {headers: {}};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await verifyPubSubToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });
});
