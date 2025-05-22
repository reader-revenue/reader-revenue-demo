/**
 * Copyright 2025 Google LLC
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
  renderCancelEntitlementsPlansButton,
  renderRefundOrderButton,
  renderReaderIdForm,
  renderPublicationIdForm,
  renderEntitlementsPlanIdForm,
  renderOrderIdForm,
  handleRefundButtonAvailability,
  handleCancelButtonAvailability
} from './cancellation-api-buttons.js';

import {
  queryLocalEntitlementsPlans,
  queryOrderData
} from './monetization-api-methods.js'

document.addEventListener('DOMContentLoaded', async function() {
  renderReaderIdForm('#readerIdForm');
  renderPublicationIdForm('#publicationIdForm');
  renderEntitlementsPlanIdForm('#entitlementsPlansIdForm');
  renderOrderIdForm('#orderIdForm')
  renderCancelEntitlementsPlansButton('#cancelEntitlementsPlansButton .button');
  renderRefundOrderButton('#refundOrderButton .button');
  const publicationId = 'process.env.PUBLICATION_ID';
  const readerId = localStorage.getItem('readerId') || '';
  if (readerId){
    document.getElementById('readerId').value = readerId;

    // entitlements
    let entitlementsPlans = await queryLocalEntitlementsPlans(publicationId, readerId)
    const statesToExclude = ['CANCELED', 'WAITING_TO_CANCEL'];
    let filteredPlans = entitlementsPlans.userEntitlementsPlans.filter(plan =>
      !statesToExclude.includes(plan.recurringPlanDetails.recurringPlanState)
    );

    // make a table to show cancellable plans
    if(filteredPlans.length>0){
      const plansTable = document.createElement('table');
      plansTable.innerHTML = `
        <thead id='planTableHead'>
          <tr>
            <th>Plan ID</th>
            <th>State</th>
            <th>Latest Order ID</th>
          </tr>
        </thead>
        <tbody id='planTableBody'>
        </tbody>
      `;
      document.getElementById('planTableDiv').appendChild(plansTable);
      
      // create a table row for each of the cancellable plans
      filteredPlans.map(plan => { 
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${plan.planId}</td>
          <td>${plan.recurringPlanDetails.recurringPlanState}</td>
          <td>${plan.purchaseInfo.latestOrderId || ''}</td>
        `;  
        document.getElementById('planTableBody').appendChild(row);      
        return {
          state: plan.recurringPlanDetails.recurringPlanState,
          entitlementsPlansId: plan.planId,
          latestOrderId: plan.purchaseInfo.latestOrderId || ''
        }  
      })
    }
    // set one value each for orederId and entitlementsPlanId
    if(filteredPlans.length>0){
      const orderId = filteredPlans[0].purchaseInfo.latestOrderId;
      document.getElementById('orderId').value = orderId;
      const entitlementPlanId = filteredPlans[0].planId;
      document.getElementById('entitlementsPlansId').value = entitlementPlanId;
      // update the button availablity
      handleCancelButtonAvailability(publicationId, readerId, entitlementPlanId);
      handleRefundButtonAvailability(publicationId, readerId, orderId);
    }
  }
});