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

import {CertificateManager} from '../lib/certs.js';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

class SslStreamProxy {
  constructor(options = {}) {
    const rawTarget =
      process.env.SSL_TARGET_DOMAIN || 'reader-revenue-demo.ue.r.appspot.com';
    this.targetDomains = (options.targetDomains || rawTarget.split(','))
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    this.proxyPort =
      options.port !== undefined
        ? options.port
        : parseInt(process.env.SSL_PROXY_PORT, 10) || 8888;
    this.proxyHost = options.host || process.env.SSL_PROXY_HOST || '0.0.0.0';
    this.appPort = parseInt(process.env.PORT, 10) || 8080;

    this.certManager = new CertificateManager({
      targetDomains: this.targetDomains,
      certsDir: options.certsDir,
    });

    this.openSockets = new Set();
    this.mitmPort = 0;

    this.mitmServer = https.createServer(
      {
        SNICallback: (servername, cb) => {
          try {
            if (!servername || !this.isTargetDomain(servername)) {
              return cb(
                new Error(`SNI servername not permitted: ${servername}`)
              );
            }
            const certData =
              this.certManager.getCertificateForDomain(servername);
            cb(null, certData.secureContext);
          } catch (err) {
            cb(err);
          }
        },
      },
      (req, res) => this.handleDecryptedRequest(req, res)
    );

    this.mitmServer.on('connection', (socket) => {
      this.openSockets.add(socket);
      socket.on('close', () => this.openSockets.delete(socket));
    });

    this.proxyServer = http.createServer((req, res) =>
      this.handleDirectRequest(req, res)
    );

    this.proxyServer.on('connection', (socket) => {
      this.openSockets.add(socket);
      socket.on('close', () => this.openSockets.delete(socket));
    });

    this.proxyServer.on('connect', (req, clientSocket, head) => {
      this.openSockets.add(clientSocket);
      clientSocket.on('close', () => this.openSockets.delete(clientSocket));
      this.handleConnect(req, clientSocket, head);
    });
  }

  isTargetDomain(host) {
    if (!host || typeof host !== 'string') {
      return false;
    }
    const cleanHost = host.split(':')[0].toLowerCase();
    return this.targetDomains.some((target) => {
      const cleanTarget = target.toLowerCase();
      return cleanHost === cleanTarget || cleanHost.endsWith(`.${cleanTarget}`);
    });
  }

  start() {
    this.mitmServer.listen(0, '127.0.0.1', () => {
      this.mitmPort = this.mitmServer.address().port;
      this.proxyServer.listen(this.proxyPort, this.proxyHost, () => {
        console.log(
          `[SSL Proxy] Active at ${this.proxyHost}:${this.proxyPort} (Targeting: ${this.targetDomains.join(', ')})`
        );
        console.log(
          `[SSL Proxy] Root CA certificate available at http://${this.proxyHost}:${this.proxyPort}/ca.crt`
        );
      });
    });
  }

  handleDirectRequest(req, res) {
    const url = new URL(
      req.url,
      `http://${req.headers.host || this.proxyHost}`
    );

    if (url.pathname === '/health') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(
        JSON.stringify({
          status: 'ok',
          proxyPort: this.proxyPort,
          targetDomains: this.targetDomains,
          appPort: this.appPort,
        })
      );
      return;
    }

    if (url.pathname === '/ca.crt') {
      const {caCrt} = this.certManager.ensureRootCA();
      res.writeHead(200, {'Content-Type': 'application/x-x509-ca-cert'});
      res.end(caCrt);
      return;
    }

    if (url.pathname === '/proxy.pac') {
      const matchPatterns = this.targetDomains
        .map((d) => `shExpMatch(host, "${d}")`)
        .join(' || ');
      const pac = `function FindProxyForURL(url, host) {
  if (${matchPatterns}) {
    return "PROXY 127.0.0.1:${this.proxyPort}";
  }
  return "DIRECT";
}
`;
      res.writeHead(200, {'Content-Type': 'application/x-ns-proxy-autoconfig'});
      res.end(pac);
      return;
    }

    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('SSL Stream Proxy - Ready');
  }

  handleConnect(req, clientSocket, head) {
    console.log(`[SSL Proxy] Incoming CONNECT: ${req.url}`);
    const [targetHost, targetPortStr] = req.url.split(':');
    const targetPort = parseInt(targetPortStr, 10) || 443;

    if (this.isTargetDomain(targetHost)) {
      console.log(
        `[SSL Proxy] Intercepting target CONNECT -> ${targetHost}:${targetPort}`
      );
      this.handleTargetConnect(targetHost, targetPort, clientSocket, head);
    } else {
      this.handleBlindTunnel(targetHost, targetPort, clientSocket, head);
    }
  }

  handleBlindTunnel(targetHost, targetPort, clientSocket, head) {
    let upstreamSocket = null;

    clientSocket.on('error', () => {
      if (upstreamSocket && !upstreamSocket.destroyed) {
        upstreamSocket.destroy();
      }
    });
    clientSocket.on('close', () => {
      if (upstreamSocket && !upstreamSocket.destroyed) {
        upstreamSocket.destroy();
      }
    });

    upstreamSocket = net.connect(targetPort, targetHost, () => {
      if (!clientSocket.destroyed && clientSocket.writable) {
        try {
          clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
          if (
            head &&
            head.length > 0 &&
            !upstreamSocket.destroyed &&
            upstreamSocket.writable
          ) {
            upstreamSocket.write(head);
          }
          upstreamSocket.pipe(clientSocket);
          clientSocket.pipe(upstreamSocket);
        } catch {
          upstreamSocket.destroy();
          if (!clientSocket.destroyed) {
            clientSocket.destroy();
          }
        }
      } else {
        upstreamSocket.destroy();
      }
    });

    upstreamSocket.on('error', () => {
      if (!clientSocket.destroyed && clientSocket.writable) {
        try {
          clientSocket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        } catch {}
      }
      if (!upstreamSocket.destroyed) {
        upstreamSocket.destroy();
      }
    });

    upstreamSocket.on('close', () => {
      if (!clientSocket.destroyed) {
        clientSocket.destroy();
      }
    });
  }

  handleTargetConnect(targetHost, targetPort, clientSocket, head) {
    let mitmConn = null;

    clientSocket.on('error', () => {
      if (mitmConn && !mitmConn.destroyed) {
        mitmConn.destroy();
      }
    });
    clientSocket.on('close', () => {
      if (mitmConn && !mitmConn.destroyed) {
        mitmConn.destroy();
      }
    });

    mitmConn = net.connect(this.mitmPort, '127.0.0.1', () => {
      if (!clientSocket.destroyed && clientSocket.writable) {
        try {
          clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
          if (
            head &&
            head.length > 0 &&
            !mitmConn.destroyed &&
            mitmConn.writable
          ) {
            mitmConn.write(head);
          }
          mitmConn.pipe(clientSocket);
          clientSocket.pipe(mitmConn);
        } catch {
          mitmConn.destroy();
          if (!clientSocket.destroyed) {
            clientSocket.destroy();
          }
        }
      } else {
        mitmConn.destroy();
      }
    });

    mitmConn.on('error', (err) => {
      console.error('[SSL Proxy] Internal loopback error:', err.message);
      if (!clientSocket.destroyed && clientSocket.writable) {
        try {
          clientSocket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        } catch {}
      }
      if (!mitmConn.destroyed) {
        mitmConn.destroy();
      }
    });

    mitmConn.on('close', () => {
      if (!clientSocket.destroyed) {
        clientSocket.destroy();
      }
    });
  }

  handleDecryptedRequest(req, res) {
    const rawHost = req.headers.host || '';
    const reqHost = rawHost.split(':')[0].toLowerCase();

    if (!this.isTargetDomain(reqHost)) {
      res.writeHead(403, {'Content-Type': 'text/plain'});
      return res.end('403 Forbidden: Target domain not permitted');
    }

    const forwardHeaders = {
      ...req.headers,
      host: req.headers.host,
      'x-forwarded-proto': 'https',
      'x-forwarded-host': req.headers.host,
      'x-forwarded-for': req.socket.remoteAddress,
    };
    delete forwardHeaders['proxy-connection'];

    const localReq = http.request(
      {
        host: '127.0.0.1',
        port: this.appPort,
        path: req.url,
        method: req.method,
        headers: forwardHeaders,
      },
      (localRes) => {
        res.writeHead(localRes.statusCode, localRes.headers);
        localRes.pipe(res);
      }
    );

    localReq.on('error', (err) => {
      console.error('[SSL Proxy] Local forward error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, {'Content-Type': 'text/plain'});
        res.end('502 Bad Gateway: Local application server unreachable');
      }
    });

    req.pipe(localReq);
  }
}

let proxyInstance = null;

export function getSslProxyInstance(options) {
  if (!proxyInstance) {
    proxyInstance = new SslStreamProxy(options);
    if (process.env.SSL_PROXY_ENABLED === 'true') {
      proxyInstance.start();
    }
  }
  return proxyInstance;
}

if (process.env.SSL_PROXY_ENABLED === 'true') {
  getSslProxyInstance();
}

const sslProxy = (req, res, next) => {
  if (
    req.headers['x-forwarded-proto'] === 'https' ||
    (req.headers.host &&
      proxyInstance &&
      proxyInstance.isTargetDomain(req.headers.host))
  ) {
    req.headers['x-forwarded-proto'] = 'https';
  }

  next();
};

export default sslProxy;
