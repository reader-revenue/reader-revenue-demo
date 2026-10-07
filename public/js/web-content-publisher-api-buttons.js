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
import {
  buildCreatorPublicationsTable,
  buildPublicationDetailsCard,
} from './web-content-publisher-api-ui.js';
import {
  createCreatorPublication,
  getPublicationDetails,
  listOrganizationPublications,
} from './web-content-publisher-api-methods.js';

/**
 * Generates a short random numeric suffix for sample Creator display names.
 * @return {string}
 */
function randomSuffix() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

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

let readOrgIdInputRef = null;
let readPubIdInputRef = null;
let triggerReadPublicationRef = null;
let triggerListPublicationsRef = null;

/**
 * Updates the Read (Get) form state and optionally triggers a read request.
 * @param {string} organizationId
 * @param {string} publicationId
 * @param {boolean} scrollAndTrigger
 */
async function selectPublicationForRead(
  organizationId,
  publicationId,
  scrollAndTrigger = false
) {
  if (organizationId) {
    publisherApiData.read.organizationId = organizationId;
    if (readOrgIdInputRef) {
      readOrgIdInputRef.value = organizationId;
    }
  }
  if (publicationId) {
    publisherApiData.read.publicationId = publicationId;
    if (readPubIdInputRef) {
      readPubIdInputRef.value = publicationId;
    }
  }
  if (scrollAndTrigger && triggerReadPublicationRef) {
    await triggerReadPublicationRef();
    document
      .querySelector('#getPublication')
      ?.scrollIntoView({behavior: 'smooth'});
  }
}

/**
 * Creates the List Creator Publications form and mounts it after the given selector.
 * @param {string} selector
 */
function createListPublicationsForm(selector) {
  const listState = publisherApiData.list;
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
          result.organizationId || listState.organizationId,
          listState.portalPublicationId,
          async (targetOrgId, targetPubId) => {
            await selectPublicationForRead(targetOrgId, targetPubId, true);
          }
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

  document.querySelector(selector)?.insertAdjacentElement('afterend', form);
}

/**
 * Creates the Create Creator Publication form and mounts it after the given selector.
 * @param {string} selector
 */
function createCreatePublicationForm(selector) {
  const createState = publisherApiData.create;
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

          await selectPublicationForRead(
            createdPub.organizationId,
            createdPub.publicationId,
            false
          );

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

  document.querySelector(selector)?.insertAdjacentElement('afterend', form);
}

/**
 * Creates the Read (Get) Publication Details form and mounts it after the given selector.
 * @param {string} selector
 */
function createGetPublicationForm(selector) {
  const readState = publisherApiData.read;
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

  document.querySelector(selector)?.insertAdjacentElement('afterend', form);
}

export {
  createCreatePublicationForm,
  createGetPublicationForm,
  createListPublicationsForm,
};
