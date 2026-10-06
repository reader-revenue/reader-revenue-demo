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
  Loader,
  createButton,
  createForm,
  createHeaderRow,
  createInput,
  createRow,
  generateHighlightedJson,
} from './utils.js';

const publisherApiData = {
  list: {
    portalPublicationId: 'process.env.PORTAL_PUBLICATION_ID',
    organizationId: 'process.env.PORTAL_ORGANIZATION_ID',
  },
  create: {
    organizationId: 'process.env.PORTAL_ORGANIZATION_ID',
    displayName: `Creator Publication #${randomSuffix()}`,
    primaryDomainUrl: '',
    languageCode: 'en',
    regionCode: 'US',
    gcpProjectNumber: 'process.env.GCP_PROJECT_NUMBER',
  },
  read: {
    organizationId: 'process.env.PORTAL_ORGANIZATION_ID',
    publicationId: 'process.env.PORTAL_PUBLICATION_ID',
  },
};

// Shared DOM references so creating or clicking a creator publication in the
// list can automatically populate and trigger the Read (Get) form.
let readOrgIdInputRef = null;
let readPubIdInputRef = null;
let triggerReadPublicationRef = null;
let triggerListPublicationsRef = null;

/**
 * Generates a short random numeric suffix for sample Creator display names.
 * @return {string}
 */
function randomSuffix() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

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
 * @return {Element}
 */
function buildCreatorPublicationsTable(
  creatorPublications,
  portalPublication,
  organizationId
) {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '16px';

  const summary = document.createElement('p');
  const portalLabel = portalPublication
    ? `${portalPublication.displayName || portalPublication.publicationId} (${portalPublication.publicationId})`
    : publisherApiData.list.portalPublicationId || '—';
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
        publisherApiData.read.organizationId = targetOrgId;
        publisherApiData.read.publicationId = targetPubId;
        if (readOrgIdInputRef) {
          readOrgIdInputRef.value = targetOrgId;
        }
        if (readPubIdInputRef) {
          readPubIdInputRef.value = targetPubId;
        }
        if (triggerReadPublicationRef) {
          await triggerReadPublicationRef();
          document
            .querySelector('#getPublication')
            ?.scrollIntoView({behavior: 'smooth'});
        }
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

/**
 * Creates the List Creator Publications form and mounts it after #listPublications.
 * @param {object} listState
 */
function createListPublicationsForm(listState) {
  const summaryContainer = document.createElement('div');
  summaryContainer.style.marginTop = '12px';
  const outputContainer = document.createElement('div');

  const updateButtonState = (button) => {
    button.disabled = !(
      listState.organizationId.trim() || listState.portalPublicationId.trim()
    );
  };

  const runList = async () => {
    summaryContainer.replaceChildren();
    outputContainer.replaceChildren();
    const loader = new Loader(outputContainer);
    loader.start();
    try {
      const result = await listOrganizationPublications(
        listState.organizationId,
        listState.portalPublicationId
      );
      loader.stop();

      if (result.organizationId) {
        listState.organizationId = result.organizationId;
        publisherApiData.create.organizationId = result.organizationId;
        publisherApiData.read.organizationId = result.organizationId;
      }

      if (Array.isArray(result.creatorPublications)) {
        const tableCard = buildCreatorPublicationsTable(
          result.creatorPublications,
          result.portalPublication,
          result.organizationId || listState.organizationId
        );
        summaryContainer.appendChild(tableCard);
      }

      outputContainer.appendChild(
        generateHighlightedJson(result.data || result)
      );
    } catch (e) {
      loader.stop();
      outputContainer.appendChild(generateHighlightedJson({error: e.message}));
    }
  };

  triggerListPublicationsRef = runList;

  const listButton = createButton({
    buttonText: 'List Creator Publications in Org',
    id: 'wcp-list-button',
    classNames: ['btn', 'btn-primary'],
    callback: async (event) => {
      event.preventDefault();
      await runList();
    },
  });

  const portalPubInput = createInput({
    initialValue: listState.portalPublicationId,
    id: 'wcp-portal-pubid-input',
    classNames: ['id-input'],
    placeHolder: 'Portal Publication ID',
    callback: (newValue) => {
      listState.portalPublicationId = newValue;
      updateButtonState(listButton);
    },
  });

  const orgIdInput = createInput({
    initialValue: listState.organizationId,
    id: 'wcp-list-orgid-input',
    placeHolder: 'Organization ID',
    callback: (newValue) => {
      listState.organizationId = newValue;
      updateButtonState(listButton);
    },
  });

  const headerRow = createHeaderRow([
    'Portal Publication ID',
    'Organization ID',
  ]);
  const inputRow = createRow('input-row', [portalPubInput, orgIdInput]);
  const form = createForm([
    headerRow,
    inputRow,
    listButton,
    summaryContainer,
    outputContainer,
  ]);

  document
    .querySelector('#listPublications')
    ?.insertAdjacentElement('afterend', form);
}

/**
 * Creates the Create Creator Publication form and mounts it after #createPublication.
 * @param {object} createState
 */
function createCreatePublicationForm(createState) {
  const detailsContainer = document.createElement('div');
  detailsContainer.style.marginTop = '12px';
  const outputContainer = document.createElement('div');

  const createBtn = createButton({
    buttonText: 'Create Creator Publication',
    id: 'wcp-create-button',
    classNames: ['btn', 'btn-primary'],
    callback: async (event) => {
      event.preventDefault();
      detailsContainer.replaceChildren();
      outputContainer.replaceChildren();
      const loader = new Loader(outputContainer);
      loader.start();
      try {
        const result = await createCreatorPublication(createState);
        loader.stop();

        if (result.data) {
          const createdPub = result.data;
          detailsContainer.appendChild(
            buildPublicationDetailsCard(
              createdPub,
              `Created Creator Publication: ${createdPub.displayName || createdPub.publicationId}`
            )
          );

          if (createdPub.publicationId) {
            publisherApiData.read.publicationId = createdPub.publicationId;
            if (readPubIdInputRef) {
              readPubIdInputRef.value = createdPub.publicationId;
            }
          }
          if (createdPub.organizationId) {
            publisherApiData.read.organizationId = createdPub.organizationId;
            if (readOrgIdInputRef) {
              readOrgIdInputRef.value = createdPub.organizationId;
            }
          }

          if (triggerListPublicationsRef) {
            await triggerListPublicationsRef();
          }
        }

        outputContainer.appendChild(
          generateHighlightedJson(result.data || result)
        );
      } catch (e) {
        loader.stop();
        outputContainer.appendChild(
          generateHighlightedJson({error: e.message})
        );
      }
    },
  });

  const updateButtonState = () => {
    createBtn.disabled = !(
      createState.organizationId.trim() &&
      createState.displayName.trim() &&
      createState.primaryDomainUrl.trim() &&
      createState.gcpProjectNumber.trim()
    );
  };

  const orgInput = createInput({
    initialValue: createState.organizationId,
    id: 'wcp-create-orgid-input',
    placeHolder: 'Organization ID',
    callback: (newValue) => {
      createState.organizationId = newValue;
      updateButtonState();
    },
  });

  const displayNameInput = createInput({
    initialValue: createState.displayName,
    id: 'wcp-create-displayname-input',
    classNames: ['id-input'],
    placeHolder: 'Creator Display Name',
    callback: (newValue) => {
      createState.displayName = newValue;
      updateButtonState();
    },
  });

  const domainUrlInput = createInput({
    initialValue: createState.primaryDomainUrl,
    id: 'wcp-create-domain-input',
    classNames: ['id-input'],
    placeHolder: 'https://example.com',
    callback: (newValue) => {
      createState.primaryDomainUrl = newValue;
      updateButtonState();
    },
  });

  const languageInput = createInput({
    initialValue: createState.languageCode,
    id: 'wcp-create-lang-input',
    placeHolder: 'en',
    callback: (newValue) => {
      createState.languageCode = newValue;
      updateButtonState();
    },
  });

  const regionInput = createInput({
    initialValue: createState.regionCode,
    id: 'wcp-create-region-input',
    placeHolder: 'US',
    callback: (newValue) => {
      createState.regionCode = newValue;
      updateButtonState();
    },
  });

  const projectNumberInput = createInput({
    initialValue: createState.gcpProjectNumber,
    id: 'wcp-create-project-input',
    placeHolder: 'GCP Project Number',
    callback: (newValue) => {
      createState.gcpProjectNumber = newValue;
      updateButtonState();
    },
  });

  const headerRow1 = createHeaderRow([
    'Organization ID',
    'Creator Display Name',
    'Primary Domain URL',
  ]);
  const row1 = createRow('input-row', [
    orgInput,
    displayNameInput,
    domainUrlInput,
  ]);

  const headerRow2 = createHeaderRow([
    'Language Code',
    'Region Code',
    'GCP Project Number',
  ]);
  const row2 = createRow('input-row', [
    languageInput,
    regionInput,
    projectNumberInput,
  ]);

  const form = createForm([
    headerRow1,
    row1,
    headerRow2,
    row2,
    createBtn,
    detailsContainer,
    outputContainer,
  ]);

  document
    .querySelector('#createPublication')
    ?.insertAdjacentElement('afterend', form);
}

/**
 * Creates the Read (Get) Publication Details form and mounts it after #getPublication.
 * @param {object} readState
 */
function createGetPublicationForm(readState) {
  const detailsContainer = document.createElement('div');
  detailsContainer.style.marginTop = '12px';
  const outputContainer = document.createElement('div');

  const runRead = async () => {
    detailsContainer.replaceChildren();
    outputContainer.replaceChildren();
    const loader = new Loader(outputContainer);
    loader.start();
    try {
      const result = await getPublicationDetails(
        readState.organizationId,
        readState.publicationId
      );
      loader.stop();

      if (result.data) {
        detailsContainer.appendChild(
          buildPublicationDetailsCard(
            result.data,
            `Publication Details: ${result.data.displayName || result.data.publicationId}`
          )
        );
      }

      outputContainer.appendChild(
        generateHighlightedJson(result.data || result)
      );
    } catch (e) {
      loader.stop();
      outputContainer.appendChild(generateHighlightedJson({error: e.message}));
    }
  };

  triggerReadPublicationRef = runRead;

  const getButton = createButton({
    buttonText: 'Read Publication Details',
    id: 'wcp-get-button',
    classNames: ['btn', 'btn-primary'],
    callback: async (event) => {
      event.preventDefault();
      await runRead();
    },
  });

  const updateButtonState = () => {
    getButton.disabled = !(
      readState.organizationId.trim() && readState.publicationId.trim()
    );
  };

  const orgIdInput = createInput({
    initialValue: readState.organizationId,
    id: 'wcp-get-orgid-input',
    placeHolder: 'Organization ID',
    callback: (newValue) => {
      readState.organizationId = newValue;
      updateButtonState();
    },
  });
  readOrgIdInputRef = orgIdInput;

  const pubIdInput = createInput({
    initialValue: readState.publicationId,
    id: 'wcp-get-pubid-input',
    classNames: ['id-input'],
    placeHolder: 'Publication ID',
    callback: (newValue) => {
      readState.publicationId = newValue;
      updateButtonState();
    },
  });
  readPubIdInputRef = pubIdInput;

  const headerRow = createHeaderRow(['Organization ID', 'Publication ID']);
  const inputRow = createRow('input-row', [orgIdInput, pubIdInput]);
  const form = createForm([
    headerRow,
    inputRow,
    getButton,
    detailsContainer,
    outputContainer,
  ]);

  document
    .querySelector('#getPublication')
    ?.insertAdjacentElement('afterend', form);
}

document.addEventListener('DOMContentLoaded', () => {
  createListPublicationsForm(publisherApiData.list);
  createCreatePublicationForm(publisherApiData.create);
  createGetPublicationForm(publisherApiData.read);
});
