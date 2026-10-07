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
  renderCreatePublicationButton,
  renderDisplayNameForm,
  renderGcpProjectNumberForm,
  renderGetPublicationButton,
  renderListPublicationsButton,
  renderOrganizationIdForm,
  renderPrimaryDomainUrlForm,
  renderPublicationIdForm,
} from './web-content-publisher-api-buttons.js';

document.addEventListener('DOMContentLoaded', () => {
  renderOrganizationIdForm('#organizationIdForm');
  renderPublicationIdForm('#publicationIdForm');
  renderDisplayNameForm('#displayNameForm');
  renderPrimaryDomainUrlForm('#primaryDomainUrlForm');
  renderGcpProjectNumberForm('#gcpProjectNumberForm');

  renderListPublicationsButton('#listPublicationsButton .button');
  renderCreatePublicationButton('#createPublicationButton .button');
  renderGetPublicationButton('#getPublicationButton .button');
});
