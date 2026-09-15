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

import {
  CertificateManager,
  doKeyAndCertMatch,
  validateDomainName,
} from '../lib/certs.js';
import {SslStreamProxy} from '../lib/ssl-stream-proxy.js';
import {join} from 'node:path';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import sslProxy, {getSslProxyInstance} from '../middleware/ssl-proxy.js';

describe('lib/certs.js, lib/ssl-stream-proxy.js, and middleware/ssl-proxy.js', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ssl-proxy-test-'));
  });

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, {recursive: true, force: true});
    }
  });

  describe('validateDomainName', () => {
    test('accepts valid domain names and lowercases them', () => {
      expect(validateDomainName('Reader-Revenue-Demo.ue.r.appspot.com')).toBe(
        'reader-revenue-demo.ue.r.appspot.com'
      );
    });

    test('rejects invalid domain names or shell metacharacters', () => {
      expect(() => validateDomainName('')).toThrow();
      expect(() => validateDomainName('example.com; rm -rf /')).toThrow();
      expect(() => validateDomainName('-invalid.com')).toThrow();
    });
  });

  describe('CertificateManager', () => {
    test('mints Root CA and matching SAN leaf certificate using template files', () => {
      const manager = new CertificateManager({
        certsDir: tempDir,
        targetDomains: ['reader-revenue-demo.ue.r.appspot.com'],
      });

      const {caKey, caCrt} = manager.ensureRootCA();
      expect(doKeyAndCertMatch(caKey, caCrt)).toBe(true);

      const leaf = manager.getCertificateForDomain(
        'reader-revenue-demo.ue.r.appspot.com'
      );
      expect(doKeyAndCertMatch(leaf.key, leaf.cert)).toBe(true);
      expect(leaf.secureContext).toBeDefined();
    });

    test('respects SSL_CERTS_DIR environment variable', () => {
      process.env.SSL_CERTS_DIR = tempDir;
      const manager = new CertificateManager();
      expect(manager.certsDir).toBe(tempDir);
      delete process.env.SSL_CERTS_DIR;
    });
  });

  describe('SslStreamProxy', () => {
    test('identifies configured target domains and subdomains', () => {
      const proxy = new SslStreamProxy({
        certsDir: tempDir,
        targetDomains: ['reader-revenue-demo.ue.r.appspot.com'],
        port: 0,
      });

      expect(
        proxy.isTargetDomain('reader-revenue-demo.ue.r.appspot.com:443')
      ).toBe(true);
      expect(proxy.isTargetDomain('accounts.google.com:443')).toBe(false);
    });
  });

  describe('sslProxy middleware & opt-in behavior', () => {
    test('does not start proxy server when SSL_PROXY_ENABLED is not true', () => {
      delete process.env.SSL_PROXY_ENABLED;
      const instance = getSslProxyInstance({
        certsDir: tempDir,
        port: 0,
      });
      expect(instance.proxyServer.listening).toBe(false);
    });

    test('sets x-forwarded-proto to https for target domain requests', () => {
      const req = {
        headers: {
          host: 'reader-revenue-demo.ue.r.appspot.com',
        },
      };
      const res = {};
      let nextCalled = false;

      sslProxy(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.headers['x-forwarded-proto']).toBe('https');
    });
  });
});
