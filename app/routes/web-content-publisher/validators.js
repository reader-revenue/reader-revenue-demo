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
 * @fileoverview Request payload validation and API error formatting helpers
 * for the Web Content Publisher API routes.
 */

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
 * Validates and normalizes the request body for creating a Creator publication.
 * @param {object} rawBody
 * @return {{valid: boolean, error?: string, requestBody?: object}}
 */
function buildCreatePublicationPayload(rawBody) {
  const body = rawBody || {};
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
    return {valid: false, error: 'displayName must be provided.'};
  }

  const domainValidation = validatePrimaryDomainUrl(rawDomainUrl);
  if (!domainValidation.valid) {
    return {valid: false, error: domainValidation.error};
  }

  if (!/^\d+$/.test(gcpProjectNumber)) {
    return {
      valid: false,
      error: 'gcpProjectNumber must be a numeric GCP project number.',
    };
  }

  return {
    valid: true,
    requestBody: {
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
    },
  };
}

export {
  buildCreatePublicationPayload,
  formatApiError,
  validatePrimaryDomainUrl,
};
