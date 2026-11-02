<script async type="application/javascript" src="{{env.SWG_JS_PUBLISHER_URL}}"></script>

# Preferred Sources: Implement with Button

The simplest method for integrating Google Preferred Sources is zero-configuration automatic initialization using a standard `<button>` element.

### Try it out
Below is a live interactive Add Preferred Source button rendered automatically by `publisher.js`:

<div class="demo-widget-container" style="margin: 20px 0;">
  <span google-add-preferred-source-btn></span>
</div>

---

## How to Implement

1. Include the `publisher.js` client library in your HTML page using `async` or `defer`.
2. Place a `<button google-add-preferred-source-btn></button>` tag anywhere you want the interaction button to render.
3. Upon load, the active-by-default runtime scans the page for the attribute, inserts an interactive iframe button, and handles all click and confirmation toast events automatically.

```html
<!DOCTYPE html>
<html>
  <head>
    <script async src="{{env.SWG_JS_PUBLISHER_URL}}"></script>
  </head>
  <body>
    <span google-add-preferred-source-btn></span>
  </body>
</html>
```
