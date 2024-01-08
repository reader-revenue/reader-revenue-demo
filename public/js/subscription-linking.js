import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/es/highlight.min.js';

import {Loader} from './utils.js';

/**
 * linkSubscription
 * Initiates a linked subscription
 * @param {number} ppid
 */
function linkSubscription(ppid) {
  self.SWG.push(async (subscriptions) => {
      try {
        const result = await subscriptions.linkSubscription({
          publisherProvidedId: ppid.trim(),
        });
        console.log(result);
      } catch(e) {
        console.log(e);
      }
  });
}

/**
 * randomPpid()
 * Generates a random ppid
 * @returns {string}
 */
function randomPpid() {
  return String(Math.floor(Math.random() * 1e6));
}


/**
 * createForm()
 * Creates a form, and appends it to the DOM after #initiateLink
 */
function createForm() {
  let ppid = randomPpid();

  const button = document.createElement('button');
  button.innerText = "Initiate Link";
  button.addEventListener('click', (event)=>{
    event.preventDefault();
    linkSubscription(ppid);
  });

  const input = document.createElement('input');
  input.setAttribute('value', ppid);
  input.setAttribute('id', 'ppid-input');
  input.onchange = (event)=>{
    ppid = event.target.value;
  };

  const form = document.createElement('form');
  form.appendChild(input);
  form.appendChild(button);

  document
      .querySelector('#initiateLink')
      .insertAdjacentElement('afterend', form);
}

/**
 * createQueryForm()
 * Creates a form, and appends it to the DOM after #initiateLink.
 * Used for querying entitlements from the api
 */
function createQueryForm() {

  let ppid = '';

  const output = document.createElement('pre');
  const code = document.createElement('code');
  code.classList.add('hljs', 'language-json');

  const button = document.createElement('button');
  button.innerText = "Query Entitlements for PPID";
  button.addEventListener('click', async (event)=>{
    event.preventDefault();
    const loader = new Loader(output);
    loader.start();
    const entitlements = await queryEntitlementsForPpid(ppid);
    const textString = JSON.stringify(entitlements, null, 2);
    const formattedTextString = hljs.highlight(textString, {language: 'json'})
    const textNodeFromString = document
        .createRange()
        .createContextualFragment(formattedTextString.value)
    code.append(textNodeFromString)
    loader.stop();
    output.append(code)
  });

  const input = document.createElement('input');
  input.setAttribute('id', 'ppid-query');
  input.onchange = (event)=>{
    ppid = event.target.value;
  };

  const form = document.createElement('form');
  form.appendChild(input);
  form.appendChild(button);
  form.appendChild(output);

  document.querySelector('#queryPpid').insertAdjacentElement('afterend', form);
}


/**
 * createUpdateForm()
 * Creates a form, and appends it to the DOM after #initiateLink.
 * Used for querying entitlements from the api
 */
function createUpdateForm() {
  let ppid = '';

  const output = document.createElement('pre');
  const code = document.createElement('code');
  code.classList.add('hljs', 'language-json');

  const button = document.createElement('button');
  button.innerText = 'Update Entitlements for PPID';
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    const loader = new Loader(output);
    loader.start();
    const entitlements = await updateEntitlementsForPpid(ppid);
    const textString = JSON.stringify(entitlements, null, 2);
    const formattedTextString = hljs.highlight(textString, {language: 'json'})
    const textNodeFromString = document.createRange().createContextualFragment(
        formattedTextString.value)
    code.append(textNodeFromString)
    loader.stop();
    output.append(code)
  });

  const input = document.createElement('input');
  input.setAttribute('id', 'ppid-query');
  input.onchange = (event) => {
    ppid = event.target.value;
  };

  const form = document.createElement('form');
  form.appendChild(input);
  form.appendChild(button);
  form.appendChild(output);

  document.querySelector('#updatePpid').insertAdjacentElement('afterend', form);
}

/**
 * queryEntitlementsForPpid(ppid)
 * @param {string} ppid The ppid of the subscriber.
 * @returns {{ppid: string}} The ppid.
 * Query entitlements for a given ppid
 */
async function queryEntitlementsForPpid(ppid) {
  const host = location.host;
  const endpoint = `api/subscription-linking/readers/${ppid}/entitlements`;
  const url = `https://${host}/${endpoint}`;
  try {
    return await fetch(url).then(r => r.json()).then(r => {return r.data});
  } catch (e) {
    throw new Error(`Unable to query entitlements at ${url}`);
  }
}

/**
 * UpdateEntitlementsForPpid(ppid)
 * @param {string} ppid The ppid of the subscriber.
 * @returns {{ppid: string}} The ppid.
 * Query entitlements for a given ppid
 */
async function updateEntitlementsForPpid(ppid) {
  const host = location.host;
  const endpoint = `api/subscription-linking/readers/${ppid}/entitlements`;
  const url = `https://${host}/${endpoint}`;
  const options = {method: 'PUT'};
  try {
    return await fetch(url, options).then(r => r.json()).then(r => {
      return r.update.data;
    });
  } catch (e) {
    throw new Error(`Unable to update entitlements at ${url}`);
  }
}

function analyticsEventLogger(subs) {
  subs.getEventManager().then(manager => {
      manager.registerEventListener((event) => {
        console.log("New analytics event: ", event);
      })
  });
}

document.addEventListener('DOMContentLoaded', function () {
  createForm();
  createQueryForm();
  createUpdateForm();
  (self.SWG = self.SWG || []).push(subscriptions => {
    subscriptions.init('prod.reader-revenue-demo.ue.r.appspot.com');
    analyticsEventLogger(subscriptions);
  });
});
