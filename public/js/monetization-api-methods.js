/**
 * Copyright 2024 Google LLC
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
 * queryLocalEntitlementsPlans
 * Queries the Monetization API, but via a local endpoint
 * @params {string} publicationId
 * @params {string} readerId
 * @returns {{object}}
 */
async function queryLocalEntitlementsPlans(publicationId, readerId) {
  const url = `${location.origin}/api/monetization/publications/${publicationId}/readers/${readerId}/entitlementsplans`;
  const requestOptions = {
    headers: {'Content-Type': 'application/json'}
  };
  return await fetch(url, requestOptions).then(r => r.json());
}

/**
 * queryMemberData
 * Queries the Monetization API, but via a local endpoint
 * @params {string} publicationId
 * @params {string} readerId
 * @returns {{object}}
 */
async function queryMemberData(publicationId, readerId) {
  const url = `${location.origin}/api/monetization/publications/${publicationId}/readers/${readerId}`;
  const requestOptions = {
    headers: {'Content-Type': 'application/json'}
  };
  return await fetch(url, requestOptions).then(r => r.json());
}

/**
 * queryOrderData
 * Queries the Monetization API, but via a local endpoint
 * @params {string} publicationId
 * @params {string} readerId
 * @returns {{object}}
 */
async function queryOrderData(publicationId, readerId) {
  const entitlementsplans = await queryLocalEntitlementsPlans(publicationId, readerId);
  const filteredPlans = entitlementsplans.userEntitlementsPlans.filter((plan)=>{
    return plan.recurringPlanDetails.recurringPlanState != 'CANCELED'
  }); 
  // retrieving the latest orderId;
  const orderId = filteredPlans[0].purchaseInfo.latestOrderId;
  const url = `${location.origin}/api/monetization/publications/${publicationId}/readers/${readerId}/orders/${orderId}`;
  const requestOptions = {
    headers: {'Content-Type': 'application/json'}
  };
  return await fetch(url, requestOptions).then(r => r.json());
}

export {
  queryLocalEntitlementsPlans,
  queryMemberData,
  queryOrderData
};