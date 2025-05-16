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
 * Cancel an entitlements plan for the given planId
 * @params {string} publicationId
 * @params {string} readerId
 * @params {string} planId 
 * @params {boolean=} cancelImmediately 
 * @returns {{object}}
 */
async function cancelEntitlementsPlans(publicationId, readerId, planId, cancelImmediately = false) {
  const url = `${location.origin}/api/cancellation/publications/${publicationId}/readers/${readerId}/entitlementsplans/${planId}/cancel`;
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({cancel_immediately: cancelImmediately})
  };
  return await fetch(url, requestOptions).then(
    async (r) => {
      const json = await r.json();
      if(json.errors) throw new Error(JSON.stringify(json.errors));
      console.log('cancelEntitlementsPlans: response json - ', json);
      return json;
    }
  ).catch(e=>{
    console.error(e);
    return e;
  })
}

/**
 * Process a refund for the given orderId
 * @params {string} publicationId
 * @params {string} readerId
 * @params {string} orderId
* @returns {{object}}
 */
async function refundOrders(publicationId, readerId, orderId) {
  const url = `${location.origin}/api/cancellation/publications/${publicationId}/readers/${readerId}/orders/${orderId}/refund`;
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  };
  return await fetch(url, requestOptions).then(
    async (r) => {
      const json = await r.json();
      if(json.errors) throw new Error(JSON.stringify(json.errors));
      console.log('refundOrders: response json - ', json);
      return json;
    }
  ).catch(e=>{
    console.error(e);
    return e;
  })
}

export {
  cancelEntitlementsPlans,
  refundOrders
};