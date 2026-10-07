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

import {AnalyticsEventHandler} from './subscription-linking-event-handler.js';
import {
  analyticsEventLogger,
  createSingleSLForm,
  subscriptionLinkingData,
} from './subscription-linking.js';

document.addEventListener('DOMContentLoaded', () => {
  const eventHandler = new AnalyticsEventHandler();
  const button = document.querySelector('.gsi-material-button');
  (self.SWG = self.SWG || []).push((subscriptions) => {
    analyticsEventLogger(subscriptions, eventHandler);
    createSingleSLForm(subscriptionLinkingData.single, eventHandler, button);
  });
});
