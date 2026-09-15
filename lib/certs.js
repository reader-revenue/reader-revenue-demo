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
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {homedir} from 'node:os';
import {join} from 'node:path';
import crypto from 'node:crypto';
import tls from 'node:tls';

/**
 * Strict RFC 1123 domain name validation.
 * Rejects any shell metacharacters, control chars, or invalid formats.
 */
export function validateDomainName(domain) {
  if (!domain || typeof domain !== 'string' || domain.length > 253) {
    throw new Error(`Invalid domain name: ${domain}`);
  }
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domain)) {
    throw new Error(`Invalid domain name: ${domain}`);
  }
  return domain.toLowerCase();
}

/**
 * Check if a private key PEM matches an X.509 certificate PEM.
 */
export function doKeyAndCertMatch(keyPem, certPem) {
  try {
    const x509 = new crypto.X509Certificate(certPem);
    const privKey = crypto.createPrivateKey(keyPem);
    return x509.checkPrivateKey(privKey);
  } catch {
    return false;
  }
}

/**
 * Check if an X.509 certificate is expired or expiring within minDaysRemaining.
 */
export function isCertExpiringSoon(certPem, minDaysRemaining = 30) {
  try {
    const x509 = new crypto.X509Certificate(certPem);
    const validTo = new Date(x509.validTo).getTime();
    const diffMs = validTo - Date.now();
    return diffMs < minDaysRemaining * 24 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

export class CertificateManager {
  constructor(options = {}) {
    this.certsDir =
      options.certsDir ||
      process.env.SSL_CERTS_DIR ||
      join(homedir(), '.config', 'reader-revenue-demo', 'certs');
    const defaultDomains = process.env.SSL_TARGET_DOMAIN
      ? [process.env.SSL_TARGET_DOMAIN]
      : ['reader-revenue-demo.ue.r.appspot.com'];
    this.targetDomains = (options.targetDomains || defaultDomains).map(
      validateDomainName
    );
    this.caKeyPath = join(this.certsDir, 'ca.key');
    this.caCrtPath = join(this.certsDir, 'ca.crt');
    this.secureContextCache = new Map();
    this.ensureDir();
  }

  ensureDir() {
    if (!existsSync(this.certsDir)) {
      mkdirSync(this.certsDir, {recursive: true, mode: 0o700});
    }
    try {
      chmodSync(this.certsDir, 0o700);
    } catch {}
  }

  /**
   * Helper to load and validate existing Root CA files from disk.
   */
  _loadValidCAFromDisk() {
    if (existsSync(this.caKeyPath) && existsSync(this.caCrtPath)) {
      try {
        const caCrt = readFileSync(this.caCrtPath, 'utf8');
        const caKey = readFileSync(this.caKeyPath, 'utf8');
        if (!isCertExpiringSoon(caCrt, 30) && doKeyAndCertMatch(caKey, caCrt)) {
          return {
            caKey,
            caCrt,
            caCrtPath: this.caCrtPath,
            caKeyPath: this.caKeyPath,
          };
        }
      } catch {}
    }
    return null;
  }

  /**
   * Ensure Root CA exists with X.509 Name Constraints, generate if missing or expiring.
   */
  ensureRootCA() {
    const existingCA = this._loadValidCAFromDisk();
    if (existingCA) {
      return existingCA;
    }

    this.ensureDir();
    const lockDir = join(this.certsDir, '.ca-mint.lock');

    let acquired = false;
    const deadline = Date.now() + 5000;

    while (Date.now() < deadline) {
      try {
        mkdirSync(lockDir, {mode: 0o700});
        acquired = true;
        break;
      } catch (err) {
        if (err.code === 'EEXIST') {
          const completedCA = this._loadValidCAFromDisk();
          if (completedCA) {
            return completedCA;
          }

          try {
            const lockStat = statSync(lockDir);
            if (Date.now() - lockStat.mtimeMs > 2000) {
              const claim = `${lockDir}.claim.${process.pid}.${Date.now()}`;
              try {
                renameSync(lockDir, claim);
              } catch {
                continue;
              }
              rmSync(claim, {recursive: true, force: true});
              try {
                mkdirSync(lockDir, {mode: 0o700});
                acquired = true;
                break;
              } catch {}
            }
          } catch {}

          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
        } else {
          break;
        }
      }
    }

    if (!acquired) {
      const completedCA = this._loadValidCAFromDisk();
      if (completedCA) {
        return completedCA;
      }
      throw new Error('Timeout acquiring Root CA minting lock');
    }

    const nonce = `${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
    const tmpKeyPath = join(this.certsDir, `ca.${nonce}.tmp.key`);
    const tmpCrtPath = join(this.certsDir, `ca.${nonce}.tmp.crt`);
    const cnfPath = join(this.certsDir, `ca.${nonce}.cnf`);

    try {
      const alreadyMinted = this._loadValidCAFromDisk();
      if (alreadyMinted) {
        return alreadyMinted;
      }

      const nameConstraintsEntries = this.targetDomains
        .map((domain) => `permitted;DNS:${domain}`)
        .join(', ');

      const cnfContent = `[req]
distinguished_name = req_dn
x509_extensions = v3_ca
prompt = no

[req_dn]
CN = Reader Revenue Local Proxy Root CA
O = Local Development Proxy
C = US

[v3_ca]
basicConstraints = critical, CA:TRUE
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
nameConstraints = critical, ${nameConstraintsEntries}
`;

      writeFileSync(cnfPath, cnfContent, 'utf8');

      execFileSync(
        'openssl',
        [
          'req',
          '-x509',
          '-newkey',
          'rsa:2048',
          '-days',
          '730',
          '-nodes',
          '-config',
          cnfPath,
          '-keyout',
          tmpKeyPath,
          '-out',
          tmpCrtPath,
        ],
        {stdio: 'ignore'}
      );

      try {
        chmodSync(tmpKeyPath, 0o600);
      } catch {}

      renameSync(tmpKeyPath, this.caKeyPath);
      renameSync(tmpCrtPath, this.caCrtPath);

      const finalKey = readFileSync(this.caKeyPath, 'utf8');
      const finalCrt = readFileSync(this.caCrtPath, 'utf8');

      if (!doKeyAndCertMatch(finalKey, finalCrt)) {
        throw new Error(
          'Root CA private key does not match certificate after atomic rename'
        );
      }

      return {
        caKey: finalKey,
        caCrt: finalCrt,
        caCrtPath: this.caCrtPath,
        caKeyPath: this.caKeyPath,
      };
    } finally {
      try {
        unlinkSync(cnfPath);
      } catch {}
      try {
        unlinkSync(tmpKeyPath);
      } catch {}
      try {
        unlinkSync(tmpCrtPath);
      } catch {}
      if (acquired) {
        try {
          rmSync(lockDir, {recursive: true, force: true});
        } catch {}
      }
    }
  }

  /**
   * Get or generate a leaf certificate for a specific domain (with SAN).
   */
  getCertificateForDomain(domain) {
    const validDomain = validateDomainName(domain);

    if (this.secureContextCache.has(validDomain)) {
      const cached = this.secureContextCache.get(validDomain);
      if (!isCertExpiringSoon(cached.cert, 30)) {
        return cached;
      }
      this.secureContextCache.delete(validDomain);
    }

    const {caCrt} = this.ensureRootCA();
    const domainKeyPath = join(this.certsDir, `${validDomain}.key`);
    const domainCrtPath = join(this.certsDir, `${validDomain}.crt`);
    const domainCsrPath = join(this.certsDir, `${validDomain}.csr`);
    const extFilePath = join(this.certsDir, `${validDomain}.ext`);

    let needGenerate = !existsSync(domainKeyPath) || !existsSync(domainCrtPath);
    if (!needGenerate) {
      const existingCrt = readFileSync(domainCrtPath, 'utf8');
      if (isCertExpiringSoon(existingCrt, 30)) {
        needGenerate = true;
      }
    }

    if (needGenerate) {
      writeFileSync(
        extFilePath,
        `authorityKeyIdentifier=keyid,issuer\nbasicConstraints=CA:FALSE\nkeyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment\nsubjectAltName = @alt_names\n\n[alt_names]\nDNS.1 = ${validDomain}\n`,
        'utf8'
      );

      execFileSync(
        'openssl',
        [
          'req',
          '-new',
          '-nodes',
          '-newkey',
          'rsa:2048',
          '-keyout',
          domainKeyPath,
          '-out',
          domainCsrPath,
          '-subj',
          `/CN=${validDomain}/O=Local Proxy/C=US`,
        ],
        {stdio: 'ignore'}
      );

      try {
        chmodSync(domainKeyPath, 0o600);
      } catch {}

      execFileSync(
        'openssl',
        [
          'x509',
          '-req',
          '-in',
          domainCsrPath,
          '-CA',
          this.caCrtPath,
          '-CAkey',
          this.caKeyPath,
          '-CAcreateserial',
          '-out',
          domainCrtPath,
          '-days',
          '365',
          '-extfile',
          extFilePath,
        ],
        {stdio: 'ignore'}
      );

      try {
        unlinkSync(domainCsrPath);
      } catch {}
      try {
        unlinkSync(extFilePath);
      } catch {}
    }

    const key = readFileSync(domainKeyPath, 'utf8');
    const leafCert = readFileSync(domainCrtPath, 'utf8');
    const fullChain = `${leafCert}\n${caCrt}`;

    const secureContext = tls.createSecureContext({
      key,
      cert: fullChain,
      ca: caCrt,
    });

    const result = {key, cert: fullChain, ca: caCrt, secureContext};
    this.secureContextCache.set(validDomain, result);
    return result;
  }
}
