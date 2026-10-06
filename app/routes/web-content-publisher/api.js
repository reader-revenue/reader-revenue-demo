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

/**
 * @fileoverview Express routes for demonstrating the Web Content Publisher API
 * (organizations.publications.create, organizations.publications.list, and
 * organizations.publications.get).
 */

import cors from 'cors';
import express from 'express';

import {WebContentPublisher} from './client.js';

const api = new WebContentPublisher();

const router = express.Router();
router.use(cors());
router.use(express.json());

/**
 * Extracts detailed error information from a GaxiosError thrown by the
 * Google APIs client.
 * @param {Error} e
 * @return {{status: number, payload: object}}
 */
function formatApiError(e) {
  const status =
    typeof e.code === 'number' && e.code >= 400 && e.code < 600 ? e.code : 500;
  const apiError = e.response?.data?.error;
  const debugDetail =
    apiError?.details?.find((d) => d.detail)?.detail ||
    apiError?.errors?.find((err) => err.debugInfo)?.debugInfo;

  return {
    status,
    payload: {
      error: e.message,
      ...(debugDetail ? {detail: debugDetail} : {}),
      ...(e.errors ? {errors: e.errors} : {}),
    },
  };
}

/**
 * Validates that a primary domain URL is a clean HTTP/HTTPS origin with no
 * trailing slash, path, query string, or fragment, matching the backend
 * RequestValidators requirements.
 * @param {string} rawUrl
 * @return {{valid: boolean, error?: string, normalizedUrl?: string}}
 */
function validatePrimaryDomainUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return {valid: false, error: 'primaryDomain.url must be set.'};
  }
  const trimmed = rawUrl.trim();
  if (trimmed.endsWith('/')) {
    return {
      valid: false,
      error: `primaryDomain.url must not end with a trailing slash: ${trimmed}`,
    };
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: `primaryDomain.url must be a valid HTTP or HTTPS URL: ${trimmed}`,
    };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: `primaryDomain.url must use http or https protocol: ${trimmed}`,
    };
  }
  if (parsed.pathname && parsed.pathname !== '/') {
    return {
      valid: false,
      error: `primaryDomain.url must not contain a URL path: ${trimmed}`,
    };
  }
  if (parsed.search) {
    return {
      valid: false,
      error: `primaryDomain.url must not contain URL query parameters: ${trimmed}`,
    };
  }
  if (parsed.hash) {
    return {
      valid: false,
      error: `primaryDomain.url must not contain URL fragments: ${trimmed}`,
    };
  }
  return {valid: true, normalizedUrl: `${parsed.protocol}//${parsed.host}`};
}

/**
 * Extracts the organizationId from a Publication resource or its resource name.
 * @param {object} publication
 * @return {string}
 */
function extractOrganizationId(publication) {
  if (!publication) {
    return '';
  }
  if (publication.organizationId) {
    return publication.organizationId;
  }
  if (typeof publication.name === 'string') {
    const match = publication.name.match(
      /^organizations\/([^/]+)\/publications\//
    );
    if (match) {
      return match[1];
    }
  }
  return '';
}

/**
 * Resolves a single publication by organizationId and publicationId.
 * Uses `organizations.publications.get` first, and falls back to a filtered
 * `organizations.publications.list` call when `organizationId` is wildcard `-`
 * or when `publicationId` is a custom vanity ID that differs from its
 * underlying Publisher Center AppFamily ID (`CAow...`).
 *
 * @param {string} organizationId
 * @param {string} publicationId
 * @return {Promise<object>}
 */
async function fetchPublication(organizationId, publicationId) {
  const client = api.init();
  const effectiveOrgId = organizationId || '-';
  if (effectiveOrgId !== '-') {
    try {
      const response = await client.organizations.publications.get({
        name: `organizations/${effectiveOrgId}/publications/${publicationId}`,
      });
      return response.data;
    } catch (getError) {
      const listFallback = await client.organizations.publications.list({
        parent: `organizations/${effectiveOrgId}`,
        filter: `publication_id = "${publicationId}"`,
        pageSize: 1,
      });
      const matched = listFallback.data?.publications?.[0];
      if (matched) {
        return matched;
      }
      throw getError;
    }
  }

  const listResponse = await client.organizations.publications.list({
    parent: 'organizations/-',
    filter: `publication_id = "${publicationId}"`,
    pageSize: 1,
  });
  const matched = listResponse.data?.publications?.[0];
  if (matched) {
    return matched;
  }

  const directResponse = await client.organizations.publications.get({
    name: `organizations/-/publications/${publicationId}`,
  });
  return directResponse.data;
}

/**
 * GetPublication (Read endpoint)
 * GET /api/web-content-publisher/organizations/:organizationId/publications/:publicationId
 */
router.get(
  '/organizations/:organizationId/publications/:publicationId',
  async (req, res) => {
    try {
      const {organizationId, publicationId} = req.params;
      const publication = await fetchPublication(organizationId, publicationId);
      return res.json({
        data: publication,
        organizationId:
          extractOrganizationId(publication) ||
          (organizationId !== '-'
            ? organizationId
            : process.env.PORTAL_ORGANIZATION_ID),
      });
    } catch (e) {
      console.error('GetPublication error:', e);
      const {status, payload} = formatApiError(e);
      return res.status(status).json(payload);
    }
  }
);

/**
 * ListPublications (List endpoint)
 * GET /api/web-content-publisher/organizations/:organizationId/publications
 */
router.get('/organizations/:organizationId/publications', async (req, res) => {
  try {
    const client = api.init();
    let {organizationId} = req.params;
    const portalPublicationId =
      typeof req.query.portalPublicationId === 'string' &&
      req.query.portalPublicationId.trim()
        ? req.query.portalPublicationId.trim()
        : process.env.PORTAL_PUBLICATION_ID;

    let portalPublication = null;
    if (organizationId === '-' && portalPublicationId) {
      try {
        portalPublication = await fetchPublication('-', portalPublicationId);
        const resolvedOrgId = extractOrganizationId(portalPublication);
        if (resolvedOrgId) {
          organizationId = resolvedOrgId;
        }
      } catch {
        if (portalPublicationId === process.env.PORTAL_PUBLICATION_ID) {
          organizationId = process.env.PORTAL_ORGANIZATION_ID;
        }
      }
    }

    const listParams = {
      parent: `organizations/${organizationId}`,
    };
    if (req.query.pageSize) {
      const parsedPageSize = Number.parseInt(String(req.query.pageSize), 10);
      if (!Number.isNaN(parsedPageSize) && parsedPageSize > 0) {
        listParams.pageSize = parsedPageSize;
      }
    }
    if (typeof req.query.pageToken === 'string' && req.query.pageToken.trim()) {
      listParams.pageToken = req.query.pageToken.trim();
    }
    if (typeof req.query.filter === 'string' && req.query.filter.trim()) {
      listParams.filter = req.query.filter.trim();
    }

    const response = await client.organizations.publications.list(listParams);
    const publications = response.data?.publications || [];

    if (!portalPublication && portalPublicationId) {
      portalPublication =
        publications.find((pub) => pub.publicationId === portalPublicationId) ||
        null;
    }

    const creatorPublications = publications.filter(
      (pub) => pub.publicationId !== portalPublicationId
    );

    return res.json({
      organizationId,
      portalPublicationId,
      portalPublication,
      creatorPublications,
      data: response.data,
    });
  } catch (e) {
    console.error('ListPublications error:', e);
    const {status, payload} = formatApiError(e);
    return res.status(status).json(payload);
  }
});

/**
 * CreatePublication (Create endpoint)
 * POST /api/web-content-publisher/organizations/:organizationId/publications
 */
router.post('/organizations/:organizationId/publications', async (req, res) => {
  try {
    const client = api.init();
    const {organizationId} = req.params;
    const body = req.body || {};
    const displayName =
      typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const rawDomainUrl = body.primaryDomain?.url || body.primaryDomainUrl || '';
    const languageCode =
      typeof body.languageCode === 'string' && body.languageCode.trim()
        ? body.languageCode.trim()
        : 'en';
    const regionCode =
      typeof body.regionCode === 'string' && body.regionCode.trim()
        ? body.regionCode.trim()
        : 'US';
    const gcpProjectNumber = String(
      body.slProduct?.gcpProjectNumber ??
        body.gcpProjectNumber ??
        process.env.GCP_PROJECT_NUMBER ??
        ''
    ).trim();

    if (!displayName) {
      return res.status(400).json({
        error: 'displayName must be provided.',
      });
    }

    const domainValidation = validatePrimaryDomainUrl(rawDomainUrl);
    if (!domainValidation.valid) {
      return res.status(400).json({
        error: domainValidation.error,
      });
    }

    if (!/^\d+$/.test(gcpProjectNumber)) {
      return res.status(400).json({
        error: 'gcpProjectNumber must be a numeric GCP project number.',
      });
    }

    const requestBody = {
      displayName,
      languageCode,
      regionCode,
      primaryDomain: {
        url: domainValidation.normalizedUrl,
      },
      slProduct: {
        enabled: true,
        gcpProjectNumber,
      },
    };

    const createResponse = await client.organizations.publications.create({
      parent: `organizations/${organizationId}`,
      requestBody,
    });

    return res.json({
      data: createResponse.data,
    });
  } catch (e) {
    console.error('CreatePublication error:', e);
    const {status, payload} = formatApiError(e);
    return res.status(status).json(payload);
  }
});

export default router;
