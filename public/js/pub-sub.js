/**
 * @fileoverview Description of this file.
 */
import {insertHighlightedJson, Loader} from './utils.js';

console.log('pub-sub');

async function pollNotifications() {
  return await fetch('/api/pub-sub/received').then(r => r.json())
}

function scheduleNotifications() {
  let currentNotifications = '';
  const id = '#testNotifications';
  const container = document.querySelector('.devsite-content-details');
  const output = document.getElementById('testNotifications');

  setInterval(async () => {
    const notifications = await pollNotifications();
    if (JSON.stringify(notifications) != currentNotifications) {
      console.log('new pub/sub messages, re-displaying');
      container.removeChild(output.nextSibling);
      insertHighlightedJson('#testNotifications', notifications);
      currentNotifications = JSON.stringify(notifications);
    }
  }, 1000)
}


async function sendNotification() {
  const body = {
    'data': '{message: \'Test notification from reader-revenue-demo\'}',
    'created': Date.now(),
    'namespace': 'pub-sub',
    'type': 'message'
  }

  await fetch('/api/pub-sub/receive', {method: 'POST', body})
}


document.addEventListener('DOMContentLoaded', async function() {
  await scheduleNotifications();

  // document.querySelector('#testNotifications').addEventListener('click', ()
  // => {
  //   sendNotification();
  // })
});
