/**
 * Copyright 2023 Google LLC
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

function oneMonthFromNow() {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString()
  }
  
  const basic = {
    product_id: `${process.env.PUBLICATION_ID}:basic`,
    subscription_token: 'abc1234',
    detail: 'This is our basic plan',
    expire_time: oneMonthFromNow()
  }
  
  const premium =
      {
        product_id: `${process.env.PUBLICATION_ID}:premium`,
        subscription_token: 'def4567',
        detail: 'This is our premium plan',
        expire_time: oneMonthFromNow()
      }
  
  function basicEntitlement(publicationId = null) {
    if(publicationId){
      basic.product_id = `${publicationId}:basic`
    }
    return {
      entitlements: [basic]
    }
  }
  
  function premiumEntitlement(publicationId = null) {
    if(publicationId){
      premium.product_id = `${publicationId}:premium`
    }
    return {
      entitlements: [premium]
    }
  }
  
  function allEntitlements() {
    return {
      entitlements: [basic, premium]
    }
  }
  
  function noEntitlements() {
    return {
      entitlements: []
    }
  }
  
  export {
    basicEntitlement, premiumEntitlement, allEntitlements, noEntitlements, oneMonthFromNow
  }