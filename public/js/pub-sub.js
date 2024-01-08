/**
 * @fileoverview Description of this file.
 */
import {insertHighlightedJson, Loader} from './utils.js';


async function pollNotifications() {
  return await fetch('/api/pub-sub/received').then(r => r.json());
}

function scheduleNotifications() {
  let currentNotifications = '';
  const output = '#notificationsLog';
  insertHighlightedJson(output, []);

  setInterval(async () => {
    const notifications = await pollNotifications();
    if (JSON.stringify(notifications) != currentNotifications) {
      console.log('new pub/sub messages, re-displaying');
      insertHighlightedJson(output, notifications);
      currentNotifications = JSON.stringify(notifications);
    }
  }, 1000)
}

document.addEventListener('DOMContentLoaded', async function() {
  await scheduleNotifications();
});
