<script async
  subscriptions-control="manual" 
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg-qual.js">
</script>

# Subscription Linking

## Client-side Javascript Demo

This form has a randomly created ppid, but can be set by the reader.

### Initiate linking with random ppid {#initiateLink}

<br>

```javascript
subscriptions.linkSubscriptions({publisherProvidedId: `ppid` });
```

### Bundle multiple publications for Subscripton Linking {#bundleLink}

You can bundle multiple publications for Subscription Linking at once.

```javascript
subscriptions.linkSubscriptions({linkTo: [
  { publicationId: 'pubId1', publisherProvidedId: 'ppid1' },
  { publicationId: 'pubId2', publisherProvidedId: 'ppid2' },
   …
]});
```

<button id="bundleSlButton">Bundle Subscription Linking</button>

## Server-side API call demo

### Query Entitlements with specified ppid {#queryPpid}


### Update Entitlements with specified ppid to `basic` {#updatePpid}


<div id="test"></div>