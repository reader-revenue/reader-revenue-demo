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

const wcpState = {
  organizationId: 'process.env.PORTAL_ORGANIZATION_ID',
  portalPublicationId: 'process.env.PORTAL_PUBLICATION_ID',
  publicationId: 'process.env.PORTAL_PUBLICATION_ID',
  displayName: `Creator Publication #${randomSuffix()}`,
  primaryDomainUrl: 'https://example.com',
  languageCode: 'en',
  regionCode: 'US',
  gcpProjectNumber: 'process.env.GCP_PROJECT_NUMBER',
};

/**
 * Runs an API request inside a step form and renders highlighted JSON into
 * the step's inline output container.
 * @param {Element} outputContainer
 * @param {Function} apiFunction
 * @return {Promise<object>}
 */
async function renderStepOutput(outputContainer, apiFunction) {
  outputContainer.replaceChildren();
  const loader = new Loader(outputContainer);
  loader.start();
  const result = await apiFunction();
  loader.stop();
  outputContainer.replaceChildren(generateHighlightedJson(result));
  return result;
}

/**
 * Creates the Step 1 form for listing publications in an organization and
 * inserts it after `#listPublications`.
 * @param {object} state
 */
function createListPublicationsForm(state) {
  const output = document.createElement('div');
  const button = createButton({
    buttonText: 'List Publications',
    id: 'listPublicationsBtn',
    callback: async (event) => {
      event.preventDefault();
      await renderStepOutput(output, () =>
        listOrganizationPublications(
          state.organizationId,
          state.portalPublicationId
        )
      );
    },
  });

  const orgIdInput = createInput({
    initialValue: state.organizationId,
    id: 'list-orgid-input',
    callback: (newValue) => {
      state.organizationId = newValue;
      button.disabled = !(
        state.organizationId.trim() || state.portalPublicationId.trim()
      );
    },
  });

  const portalPubIdInput = createInput({
    initialValue: state.portalPublicationId,
    id: 'list-portal-pubid-input',
    callback: (newValue) => {
      state.portalPublicationId = newValue;
      button.disabled = !(
        state.organizationId.trim() || state.portalPublicationId.trim()
      );
    },
  });

  const headerRow = createHeaderRow(['OrganizationID', 'PortalPublicationID']);
  const inputRow = createRow('input-row', [orgIdInput, portalPubIdInput]);
  const form = createForm([headerRow, inputRow, button, output]);
  document
    .querySelector('#listPublications')
    .insertAdjacentElement('afterend', form);
}

/**
 * Creates the Step 2 form for provisioning a new Creator publication and
 * inserts it after `#createPublication`.
 * @param {object} state
 */
function createCreatePublicationForm(state) {
  const output = document.createElement('div');
  const updateCreateDisabled = (btn) => {
    btn.disabled = !(
      state.organizationId.trim() &&
      state.displayName.trim() &&
      state.primaryDomainUrl.trim() &&
      state.gcpProjectNumber.trim()
    );
  };

  const button = createButton({
    buttonText: 'Create Publication',
    id: 'createPublicationBtn',
    callback: async (event) => {
      event.preventDefault();
      const result = await renderStepOutput(output, () =>
        createCreatorPublication(state)
      );
      if (result?.data?.publicationId) {
        state.publicationId = result.data.publicationId;
        const queryPubInput = document.querySelector('#query-pubid-input');
        if (queryPubInput) {
          queryPubInput.value = result.data.publicationId;
        }
      }
    },
  });

  const orgIdInput = createInput({
    initialValue: state.organizationId,
    id: 'create-orgid-input',
    callback: (newValue) => {
      state.organizationId = newValue;
      updateCreateDisabled(button);
    },
  });

  const gcpProjectInput = createInput({
    initialValue: state.gcpProjectNumber,
    id: 'create-gcp-project-input',
    callback: (newValue) => {
      state.gcpProjectNumber = newValue;
      updateCreateDisabled(button);
    },
  });

  const displayNameInput = createInput({
    initialValue: state.displayName,
    id: 'create-display-name-input',
    callback: (newValue) => {
      state.displayName = newValue;
      updateCreateDisabled(button);
    },
  });

  const primaryDomainInput = createInput({
    initialValue: state.primaryDomainUrl,
    id: 'create-domain-url-input',
    placeHolder: 'https://example.com',
    callback: (newValue) => {
      state.primaryDomainUrl = newValue;
      updateCreateDisabled(button);
    },
  });

  const headerRow1 = createHeaderRow(['OrganizationID', 'GCPProjectNumber']);
  const inputRow1 = createRow('input-row', [orgIdInput, gcpProjectInput]);
  const headerRow2 = createHeaderRow(['DisplayName', 'PrimaryDomainURL']);
  const inputRow2 = createRow('input-row', [
    displayNameInput,
    primaryDomainInput,
  ]);
  const form = createForm([
    headerRow1,
    inputRow1,
    headerRow2,
    inputRow2,
    button,
    output,
  ]);
  document
    .querySelector('#createPublication')
    .insertAdjacentElement('afterend', form);
}

/**
 * Creates the Step 3 form for querying a single publication's details and
 * inserts it after `#queryPublication`.
 * @param {object} state
 */
function createQueryPublicationForm(state) {
  const output = document.createElement('div');
  const button = createButton({
    buttonText: 'Query Publication Details',
    id: 'getPublicationBtn',
    callback: async (event) => {
      event.preventDefault();
      await renderStepOutput(output, () =>
        getPublicationDetails(state.organizationId, state.publicationId)
      );
    },
  });

  const orgIdInput = createInput({
    initialValue: state.organizationId,
    id: 'query-orgid-input',
    callback: (newValue) => {
      state.organizationId = newValue;
      button.disabled = !(
        state.organizationId.trim() && state.publicationId.trim()
      );
    },
  });

  const pubIdInput = createInput({
    initialValue: state.publicationId,
    id: 'query-pubid-input',
    callback: (newValue) => {
      state.publicationId = newValue;
      button.disabled = !(
        state.organizationId.trim() && state.publicationId.trim()
      );
    },
  });

  const headerRow = createHeaderRow(['OrganizationID', 'PublicationID']);
  const inputRow = createRow('input-row', [orgIdInput, pubIdInput]);
  const form = createForm([headerRow, inputRow, button, output]);
  document
    .querySelector('#queryPublication')
    .insertAdjacentElement('afterend', form);
}

export {
  createCreatePublicationForm,
  createListPublicationsForm,
  createQueryPublicationForm,
  wcpState,
};
