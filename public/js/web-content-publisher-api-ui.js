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

import {createButton} from './utils.js';

/**
 * Builds a structured details summary card for a Publication resource using
 * safe DOM APIs (createElement / textContent).
 * @param {object} publication
 * @param {string} headingText
 * @return {Element}
 */
function buildPublicationDetailsCard(publication, headingText) {
  const container = document.createElement('div');
  container.classList.add('card');
  container.style.padding = '16px';
  container.style.marginBottom = '16px';
  container.style.backgroundColor = '#ffffff';

  const title = document.createElement('h4');
  title.textContent =
    headingText ||
    `Publication Details: ${publication.displayName || publication.publicationId || ''}`;
  title.style.marginTop = '0';
  container.appendChild(title);

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  const fields = [
    ['Resource Name', publication.name || '—'],
    ['Publication ID', publication.publicationId || '—'],
    ['Organization ID', publication.organizationId || '—'],
    ['Display Name', publication.displayName || '—'],
    ['Primary Domain URL', publication.primaryDomain?.url || '—'],
    [
      'Domain Ownership Verified',
      publication.primaryDomain?.ownershipVerified ? 'Yes' : 'No',
    ],
    [
      'Language / Region',
      `${publication.languageCode || '—'} / ${publication.regionCode || '—'}`,
    ],
    [
      'Subscription Linking Enabled',
      publication.slProduct?.enabled ? 'Yes' : 'No',
    ],
    [
      'GCP Project Number',
      publication.slProduct?.gcpProjectNumber
        ? String(publication.slProduct.gcpProjectNumber)
        : '—',
    ],
  ];

  const tbody = document.createElement('tbody');
  for (const [label, value] of fields) {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #e8eaed';

    const th = document.createElement('th');
    th.textContent = label;
    th.style.textAlign = 'left';
    th.style.padding = '6px 8px';
    th.style.width = '35%';

    const td = document.createElement('td');
    const code = document.createElement('code');
    code.textContent = value;
    td.appendChild(code);
    td.style.padding = '6px 8px';

    tr.appendChild(th);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);
  return container;
}

/**
 * Builds an interactive table of Creator publications in the organization,
 * with a button on each row to inspect that publication via the Get endpoint.
 * @param {object[]} creatorPublications
 * @param {object|null} portalPublication
 * @param {string} organizationId
 * @param {string} fallbackPortalPublicationId
 * @param {function(string, string): Promise<void>} onInspectPublication
 * @return {Element}
 */
function buildCreatorPublicationsTable(
  creatorPublications,
  portalPublication,
  organizationId,
  fallbackPortalPublicationId,
  onInspectPublication
) {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';

  const summary = document.createElement('p');
  const portalLabel = portalPublication
    ? `${portalPublication.displayName || portalPublication.publicationId} (${portalPublication.publicationId})`
    : fallbackPortalPublicationId || '—';
  summary.textContent = `Organization ${organizationId} — Portal: ${portalLabel} | Creator Publications: ${creatorPublications.length}`;
  summary.style.fontWeight = 'bold';
  wrapper.appendChild(summary);

  if (creatorPublications.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent =
      'No creator publications found in this organization yet. Use the Create form below to provision one.';
    wrapper.appendChild(emptyMsg);
    return wrapper;
  }

  const table = document.createElement('table');
  table.id = 'planTable';
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  const thead = document.createElement('thead');
  thead.id = 'planTableHead';
  const headerTr = document.createElement('tr');
  const headers = [
    'Display Name',
    'Publication ID',
    'Primary Domain',
    'Verified',
    'SL Enabled',
    'Action',
  ];
  for (const text of headers) {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.padding = '8px';
    headerTr.appendChild(th);
  }
  thead.appendChild(headerTr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.id = 'planTableBody';

  for (const pub of creatorPublications) {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #ccc';

    const nameTd = document.createElement('td');
    nameTd.textContent = pub.displayName || '—';

    const idTd = document.createElement('td');
    const idCode = document.createElement('code');
    idCode.textContent = pub.publicationId || '—';
    idTd.appendChild(idCode);

    const domainTd = document.createElement('td');
    domainTd.textContent = pub.primaryDomain?.url || '—';

    const verifiedTd = document.createElement('td');
    verifiedTd.textContent = pub.primaryDomain?.ownershipVerified
      ? 'Yes'
      : 'No';

    const slTd = document.createElement('td');
    slTd.textContent = pub.slProduct?.enabled ? 'Yes' : 'No';

    const actionTd = document.createElement('td');
    const inspectBtn = createButton({
      buttonText: 'Inspect Details',
      classNames: ['btn', 'btn-sm', 'btn-primary'],
      callback: async (event) => {
        event.preventDefault();
        const targetOrgId = pub.organizationId || organizationId;
        const targetPubId = pub.publicationId;
        await onInspectPublication(targetOrgId, targetPubId);
      },
    });
    actionTd.appendChild(inspectBtn);

    tr.appendChild(nameTd);
    tr.appendChild(idTd);
    tr.appendChild(domainTd);
    tr.appendChild(verifiedTd);
    tr.appendChild(slTd);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  wrapper.appendChild(table);
  return wrapper;
}

export {buildCreatorPublicationsTable, buildPublicationDetailsCard};
