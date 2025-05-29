<script async
  subscriptions-control="manual" 
  type="application/javascript"
  src="https://news.google.com/swg/js/v1/swg.js">
</script>

# Subscription Linking

## Client-side Javascript Demo

This form has a randomly created ppid, but can be set by the reader.

### Initiate linking with random ppid {#initiateLink}

<br>

```html
<script>
subscriptions.linkSubscriptions({publisherProvidedId: `ppid` });
</script>
```

### Bundle multiple publications for Subscripton Linking {#bundleLink}

<br>

```html
<script>
subscriptions.linkSubscriptions({linkTo: [
  { publicationId: 'pubId1', publisherProvidedId: 'ppid1' },
  { publicationId: 'pubId2', publisherProvidedId: 'ppid2' },
   …
]});
</script>
```

## Server-side API call demo

### Query Entitlements with specified ppid {#queryPpid}

### Update Entitlements with specified ppid to `basic` {#updatePpid}

```html
{
  product_id: '{{env.PUBLICATION_ID}}:basic',
  subscription_token: 'abc1234',
  detail: 'This is our basic plan',
  expire_time: '{{oneMonthFromNow}}'
}
```
