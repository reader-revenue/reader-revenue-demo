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
 * @fileoverview Publication lookup, listing, and creation helpers for the
 * Web Content Publisher API routes.
 */

import {buildCreatePublicationPayload} from './validators.js';

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
 * @param {object} client
 * @param {string} organizationId
 * @param {string} publicationId
 * @return {Promise<object>}
 */
async function fetchPublication(client, organizationId, publicationId) {
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
 * Fetches a single publication and resolves its owning organizationId.
 * @param {object} client
 * @param {string} organizationId
 * @param {string} publicationId
 * @return {Promise<object>}
 */
async function getOrganizationPublication(
  client,
  organizationId,
  publicationId
) {
  const publication = await fetchPublication(
    client,
    organizationId,
    publicationId
  );
  return {
    data: publication,
    organizationId:
      extractOrganizationId(publication) ||
      (organizationId !== '-'
        ? organizationId
        : process.env.PORTAL_ORGANIZATION_ID),
  };
}

/**
 * Lists all publications under an organization and separates the Portal
 * publication from Creator publications.
 * @param {object} client
 * @param {string} initialOrganizationId
 * @param {object} query
 * @return {Promise<object>}
 */
async function listOrganizationPublications(
  client,
  initialOrganizationId,
  query = {}
) {
  let organizationId = initialOrganizationId;
  const portalPublicationId =
    typeof query.portalPublicationId === 'string' &&
    query.portalPublicationId.trim()
      ? query.portalPublicationId.trim()
      : process.env.PORTAL_PUBLICATION_ID;

  let portalPublication = null;
  if (organizationId === '-' && portalPublicationId) {
    try {
      portalPublication = await fetchPublication(
        client,
        '-',
        portalPublicationId
      );
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
  if (query.pageSize) {
    const parsedPageSize = Number.parseInt(String(query.pageSize), 10);
    if (!Number.isNaN(parsedPageSize) && parsedPageSize > 0) {
      listParams.pageSize = parsedPageSize;
    }
  }
  if (typeof query.pageToken === 'string' && query.pageToken.trim()) {
    listParams.pageToken = query.pageToken.trim();
  }
  if (typeof query.filter === 'string' && query.filter.trim()) {
    listParams.filter = query.filter.trim();
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

  return {
    organizationId,
    portalPublicationId,
    portalPublication,
    creatorPublications,
    data: response.data,
  };
}

/**
 * Validates and creates a new Creator publication under the given organization.
 * @param {object} client
 * @param {string} organizationId
 * @param {object} body
 * @return {Promise<{data?: object, validationError?: string}>}
 */
async function createOrganizationPublication(client, organizationId, body) {
  const payload = buildCreatePublicationPayload(body);
  if (!payload.valid) {
    return {validationError: payload.error};
  }

  const createResponse = await client.organizations.publications.create({
    parent: `organizations/${organizationId}`,
    requestBody: payload.requestBody,
  });

  return {
    data: createResponse.data,
  };
}

export {
  createOrganizationPublication,
  extractOrganizationId,
  fetchPublication,
  getOrganizationPublication,
  listOrganizationPublications,
};
