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
 * @fileoverview This client-side js file is used to 
 * poll and display received notifications issued from
 * Cloud Pub/Sub, and stored in Cloud Datastore.
 */
import {insertHighlightedJson, Loader} from './utils.js';

// https://developers.google.com/news/reader-revenue/monetization/reference/pub-sub-types
const pubsubEventTypes = [
  'SUBSCRIPTION_STARTED',
  'SUBSCRIPTION_WAITING_TO_RECUR',
  'SUBSCRIPTION_WAITING_TO_CANCEL',
  'SUBSCRIPTION_CANCELED',
  'SUBSCRIPTION_FIX_REQUIRED',
  'PURCHASE_ORDER_REFUNDED',
  'RECURRING_CONTRIBUTIONS_STARTED',
  'RECURRING_CONTRIBUTIONS_WAITING_TO_CANCEL',
  'RECURRING_CONTRIBUTIONS_CANCELED',
  'ONE_TIME_CONTRIBUTION_STARTED',
  'SUBSCRIPTION_LINKED',
  'SUBSCRIPTION_UNLINKED'
];
let notificationLog;
let cachedNotifications = [];

async function pollNotifications() {
  const params = new URLSearchParams();
  params.append("previousMessageVolume", cachedNotifications.length);
  return await fetch(`/api/pub-sub/received?${params}`)
    .then(r => r.json())
    .catch(e => console.log(e));
}

function scheduleNotifications() {
  let emptyOutputPlaceHolder = null; 
  const loader = new Loader(
    document.getElementById(`notificationsLog`), 
    30000, // timeout to loading in 30 seconds
    () => { 
      // callback onTimeout:  inserting an empty array [] as output
      emptyOutputPlaceHolder = insertHighlightedJson(`#notificationsLog`, [], null, null, true);
    }
  );
  loader.start();

  // A variable to hold the interval ID.
  // This is the key to stopping the interval later.
  let pollingInterval;
  // Start the polling interval and save its ID.
  pollingInterval = setInterval(async () => {
    // poll the backend for new notifications
    let notifications = await pollNotifications();
    // check if notifications were received
    if (notifications?.length > 0) {
      // cache the latest notifications
      cachedNotifications = notifications;
      // remove the placeholder output ([]) if it's already added
      // emptyOutputPlaceHolder is non null if the loader's onTimeout callback is already executed
      if (emptyOutputPlaceHolder) {
        emptyOutputPlaceHolder.remove();
        emptyOutputPlaceHolder = null;
      }
      // Filter the notifications and show in #notificationsLog
      showNotifications(filter(notifications));
      // stop the loading indicator now that content is displayed.
      if (loader.isStopped === false) {
        loader.stop();
      }
      // Kill the interval here after showing the notifications
      clearInterval(pollingInterval);
    }
  }, 1000);
}
document.addEventListener('DOMContentLoaded', async function() {
  await scheduleNotifications();
  createEventTypeSelectElement();
  createRecent100FilterCheckboxElement();
});
/**
 * Create select element to filter notifications depends on the eventType (e.g. SUBSCRIPTION_STARTED)
 * https://developers.google.com/news/reader-revenue/monetization/reference/pub-sub-types
 */
function createEventTypeSelectElement(){
  const selectEventTypeElement = document.createElement('select');
  selectEventTypeElement.setAttribute('id', 'select-event-type');
  var options = [];
  pubsubEventTypes.forEach(eventType=>{
    options.push(`<option value='${eventType}'>${eventType}</option>`);
  });
  selectEventTypeElement.innerHTML = options.join();
  selectEventTypeElement.addEventListener('change', e =>{
    handleFilterChange(cachedNotifications);
  });
  document.getElementById('select-event-filter-container').append(selectEventTypeElement);
}
/**
 * Create checkbox to show most recent 100 notifications, unchecked by default
 */
function createRecent100FilterCheckboxElement(){
  const checkboxFilterRecent100Element = document.createElement('input');
  checkboxFilterRecent100Element.setAttribute('id', 'checkbox-recent-100');
  checkboxFilterRecent100Element.setAttribute('type', 'checkbox');
  checkboxFilterRecent100Element.setAttribute('name', 'recent-100');
  const label = document.createElement('label');
  label.setAttribute('for', 'recent-100');
  label.innerHTML = '&nbsp;Show 100 most recent notifications';
  checkboxFilterRecent100Element.addEventListener('change', e =>{
    handleFilterChange(cachedNotifications);
  });
  document.getElementById('checkbox-filter-container').append(checkboxFilterRecent100Element);
  checkboxFilterRecent100Element.after(label);
}
/**
 * Event listener to handle filter change (select element and checkbox)
 * @param {object[]} notifications
 */
function handleFilterChange(notifications){
  if(!notifications){
    return;
  }
  notifications = filter(notifications);
  if(notifications.length===0){
    return;
  }
  showNotifications(notifications);
}
/**
 * Show the latest Pub/Sub notifications at #notificationsLog
 * @param {object[]} notifications
 */
function showNotifications(notifications){
  // remove the current log if it's already in the DOM
  if(notificationLog){
    notificationLog.remove();
  }
  notificationLog = insertHighlightedJson(`#notificationsLog`, notifications, null, null, true);
}
/**
 * Filter notifications depends on the event type (select) and checkbox to show 100 most recent events only 
 * @param {object[]} notifications
 * @return {object[]} 
*/
function filter(notifications){
  const eventType = document.getElementById('select-event-type').value;
  // filtering by the event type (e.g. SUBSCRIPTION_STARTED)
  notifications = filterByEventType(notifications,eventType);
  if(document.getElementById('checkbox-recent-100').checked){
    // sort by the createTime (DESC) and showing the 100 most recent events
    notifications = notifications.sort((a,b) => {
      return a.createTime > b.createTime ? 1 : -1;
    }).splice(0,100);
  }
  return notifications;
}
/**
 * Filtering by the event type 
 * @param {object[]} notifications
 * @param {string} eventType e.g. SUBSCRIPTION_STARTED
 * @return {object[]} 
*/
function filterByEventType(notifications, eventType){
  return notifications.filter(notification=>JSON.parse(notification.data).eventType === eventType)
}