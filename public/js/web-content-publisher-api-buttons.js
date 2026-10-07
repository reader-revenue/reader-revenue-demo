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
  createButton,
  createForm,
  createInput,
  executeApiCall,
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
  publicationId: 'process.env.PORTAL_PUBLICATION_ID',
  displayName: `Creator Publication #${randomSuffix()}`,
  primaryDomainUrl: '',
  languageCode: 'en',
  regionCode: 'US',
  gcpProjectNumber: 'process.env.GCP_PROJECT_NUMBER',
};

/**
 * Updates the disabled state of the List, Create, and Get buttons based on
 * current form input values.
 */
function handleButtonAvailability() {
  const listButton = document.querySelector('#listPublicationsBtn');
  if (listButton) {
    listButton.disabled = !(
      wcpState.organizationId.trim() || wcpState.publicationId.trim()
    );
  }

  const createButtonEl = document.querySelector('#createPublicationBtn');
  if (createButtonEl) {
    createButtonEl.disabled = !(
      wcpState.organizationId.trim() &&
      wcpState.displayName.trim() &&
      wcpState.primaryDomainUrl.trim() &&
      wcpState.gcpProjectNumber.trim()
    );
  }

  const getButton = document.querySelector('#getPublicationBtn');
  if (getButton) {
    getButton.disabled = !(
      wcpState.organizationId.trim() && wcpState.publicationId.trim()
    );
  }
}

/**
 * Renders the organizationId input form.
 * @param {string} selector
 */
function renderOrganizationIdForm(selector) {
  const input = createInput({
    initialValue: wcpState.organizationId,
    id: 'organizationId',
    classNames: ['id-input'],
    placeHolder: 'Paste organizationId here',
    callback: (newValue) => {
      wcpState.organizationId = newValue;
      handleButtonAvailability();
    },
  });
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * Renders the publicationId input form.
 * @param {string} selector
 */
function renderPublicationIdForm(selector) {
  const input = createInput({
    initialValue: wcpState.publicationId,
    id: 'publicationId',
    classNames: ['id-input'],
    placeHolder: 'Paste publicationId here',
    callback: (newValue) => {
      wcpState.publicationId = newValue;
      handleButtonAvailability();
    },
  });
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * Renders the displayName input form for creating a Creator publication.
 * @param {string} selector
 */
function renderDisplayNameForm(selector) {
  const input = createInput({
    initialValue: wcpState.displayName,
    id: 'displayName',
    classNames: ['id-input'],
    placeHolder: 'Creator Display Name',
    callback: (newValue) => {
      wcpState.displayName = newValue;
      handleButtonAvailability();
    },
  });
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * Renders the primaryDomain.url input form for creating a Creator publication.
 * @param {string} selector
 */
function renderPrimaryDomainUrlForm(selector) {
  const input = createInput({
    initialValue: wcpState.primaryDomainUrl,
    id: 'primaryDomainUrl',
    classNames: ['id-input'],
    placeHolder: 'https://example.com',
    callback: (newValue) => {
      wcpState.primaryDomainUrl = newValue;
      handleButtonAvailability();
    },
  });
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * Renders the gcpProjectNumber input form for creating a Creator publication.
 * @param {string} selector
 */
function renderGcpProjectNumberForm(selector) {
  const input = createInput({
    initialValue: wcpState.gcpProjectNumber,
    id: 'gcpProjectNumber',
    classNames: ['id-input'],
    placeHolder: 'Paste GCP project number here',
    callback: (newValue) => {
      wcpState.gcpProjectNumber = newValue;
      handleButtonAvailability();
    },
  });
  const form = createForm([input]);
  document.querySelector(selector).appendChild(form);
}

/**
 * Renders the button to list publications in an organization.
 * @param {string} selector
 */
function renderListPublicationsButton(selector) {
  const button = createButton({
    buttonText: 'List publications',
    id: 'listPublicationsBtn',
    classNames: ['btn', 'btn-primary'],
    disable: !(wcpState.organizationId.trim() || wcpState.publicationId.trim()),
    callback: () =>
      executeApiCall(
        () =>
          listOrganizationPublications(
            wcpState.organizationId,
            wcpState.publicationId
          ),
        'Publications for the given <code>organizationId</code>'
      ),
  });
  document.querySelector(selector).appendChild(button);
}

/**
 * Renders the button to create a new Creator publication in an organization.
 * @param {string} selector
 */
function renderCreatePublicationButton(selector) {
  const button = createButton({
    buttonText: 'Create publication',
    id: 'createPublicationBtn',
    classNames: ['btn', 'btn-primary'],
    disable: !(
      wcpState.organizationId.trim() &&
      wcpState.displayName.trim() &&
      wcpState.primaryDomainUrl.trim() &&
      wcpState.gcpProjectNumber.trim()
    ),
    callback: () =>
      executeApiCall(async () => {
        const result = await createCreatorPublication(wcpState);
        if (result.data?.publicationId) {
          wcpState.publicationId = result.data.publicationId;
          const pubInput = document.querySelector('#publicationId');
          if (pubInput) {
            pubInput.value = result.data.publicationId;
          }
          handleButtonAvailability();
        }
        return result;
      }, 'Created Creator publication for the given <code>organizationId</code>'),
  });
  document.querySelector(selector).appendChild(button);
}

/**
 * Renders the button to fetch a single publication's details.
 * @param {string} selector
 */
function renderGetPublicationButton(selector) {
  const button = createButton({
    buttonText: 'Query publication details',
    id: 'getPublicationBtn',
    classNames: ['btn', 'btn-primary'],
    disable: !(wcpState.organizationId.trim() && wcpState.publicationId.trim()),
    callback: () =>
      executeApiCall(
        () =>
          getPublicationDetails(
            wcpState.organizationId,
            wcpState.publicationId
          ),
        'Publication details for the given <code>publicationId</code>'
      ),
  });
  document.querySelector(selector).appendChild(button);
}

export {
  renderCreatePublicationButton,
  renderDisplayNameForm,
  renderGcpProjectNumberForm,
  renderGetPublicationButton,
  renderListPublicationsButton,
  renderOrganizationIdForm,
  renderPrimaryDomainUrlForm,
  renderPublicationIdForm,
};
