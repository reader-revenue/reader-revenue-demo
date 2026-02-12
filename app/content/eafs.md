# Extended Access from Search (EAfS)

This example demonstrates how to call the `checkFreeAccess` API for Extended Access from Search (EAfS).

## API Configuration

<div class="form-group">
  <label for="httpReferrer">Http Referrer</label>
  <input type="text" class="form-control" id="httpReferrer" value="https://www.google.com">
</div>

<div class="form-group">
  <label for="contentUri">Content URI</label>
  <input type="text" class="form-control" id="contentUri" value="https://www.yourpublication.com/article/123">
</div>

<button id="checkAccess" class="btn btn-primary">Check Free Access</button>

## Output

<div id="output"></div>

!!! info **Note**
This API call is performed server-side using a service account with the `subscribewithgoogle.publications.entitlements.readonly` scope.
!!!
