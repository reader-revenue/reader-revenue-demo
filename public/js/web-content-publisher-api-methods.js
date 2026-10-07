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
 * Calls the server-side List endpoint for an organization.
 * @param {string} organizationId
 * @param {string} portalPublicationId
 * @return {Promise<object>}
 */
async function listOrganizationPublications(
  organizationId,
  portalPublicationId
) {
  const encodedOrg = encodeURIComponent(organizationId.trim() || '-');
  const query = portalPublicationId
    ? `?portalPublicationId=${encodeURIComponent(portalPublicationId.trim())}`
    : '';
  const url = `${location.origin}/api/web-content-publisher/organizations/${encodedOrg}/publications${query}`;
  const response = await fetch(url);
  return await response.json();
}

/**
 * Calls the server-side Create endpoint to create a new Creator publication.
 * @param {object} createState
 * @return {Promise<object>}
 */
async function createCreatorPublication(createState) {
  const encodedOrg = encodeURIComponent(createState.organizationId.trim());
  const url = `${location.origin}/api/web-content-publisher/organizations/${encodedOrg}/publications`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName: createState.displayName.trim(),
      primaryDomain: {
        url: createState.primaryDomainUrl.trim(),
      },
      languageCode: createState.languageCode.trim(),
      regionCode: createState.regionCode.trim(),
      slProduct: {
        enabled: true,
        gcpProjectNumber: createState.gcpProjectNumber.trim(),
      },
    }),
  });
  return await response.json();
}

/**
 * Calls the server-side Read (Get) endpoint for a single publication.
 * @param {string} organizationId
 * @param {string} publicationId
 * @return {Promise<object>}
 */
async function getPublicationDetails(organizationId, publicationId) {
  const encodedOrg = encodeURIComponent(organizationId.trim() || '-');
  const encodedPub = encodeURIComponent(publicationId.trim());
  const url = `${location.origin}/api/web-content-publisher/organizations/${encodedOrg}/publications/${encodedPub}`;
  const response = await fetch(url);
  return await response.json();
}

export {
  createCreatorPublication,
  getPublicationDetails,
  listOrganizationPublications,
};
