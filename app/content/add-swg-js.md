

# Add swg.js


!!! info ★**No Demo**: Only code samples are available 
!!!

Initialize SwG client `swg.js` to access all SwG functions on the web. The SwG client is distributed as a JavaScript library at `https://news.google.com/swg/js/v1/swg.js`. There are two methods of initializing the JavaScript library:



1. **Auto Initialization** \
Recommended if [Structured Data Markup](https://gtech-demo.appspot.com/html/markup-article-pages.html) is present on pages (e.g. articles pages).
1. **Manual Initialization** \
Can be used on pages with **no** Structured Data Markup (e.g. product pages).

Read the [documentation](https://developers.google.com/news/subscribe/guides/add-swg-js).


## Try it yourself


### Auto Initialization



1. Your page should already have a [Structured Data Markup](https://gtech-demo.appspot.com/html/markup-article-pages.html).
1. Include the SwG client on your page using a `<script>` tag.
1. Add a client ready callback. When `swg.js` is initialized, the callback returns a JavaScript object `subscriptions`, which contains all the SwG functionalities.


```html 
<html>
  <head>
    <!-- 2. Include the swg client -->
    <script async type="application/javascript"
            src="https://news.google.com/swg/js/v1/swg.js"></script>

    <!-- 3. Add a client ready callback -->
    <script>
      (self.SWG = self.SWG || []).push( subscriptions => {
         // swg.js initializes automatically, returns swg.js functions an object.
         console.log(subscriptions);
      });
    </script>
  </head>
  <body>
    <p>Your article content</p>

    <!-- 1. Include Structured Data Markup -->
    <script type="application/ld+json">
      {
        "@context": "http://schema.org",
        "@type": "NewsArticle",
        "headline": "gTech Swg Demo",
        "image": "your_publisher_logo_url",
        "datePublished": "2025-02-05T08:00:00+08:00",
        "dateModified": "2025-02-05T09:20:00+08:00",
        "author": {
        "@type": "Person",
        "name": "John Doe"
        },
        "publisher": {
            "name": "GTech Demo Pub News",
            "@type": "Organization",
            "@id": "gtech-demo-staging.appspot.com",
            "logo": {
            "@type": "ImageObject",
            "url": "/icons/icon-2x.png"
            }
        },
        "description": "This example loads a carousel of offers on click.",
        "isAccessibleForFree": "False",
        "isPartOf": {
            "@type": ["CreativeWork", "Product"],
            "name" : "GTech Demo Pub News basic",
            "productID": "gtech-demo-staging.appspot.com:basic"
        }
      }
    </script>
  </body>
</html>
```



### Manual Initialization



1. Include the SwG client on your page using a `<script>` tag.
1. Add a client ready callback.
1. Initialize the SwG client using a Publication ID `subscriptions.init(publicationId)` or a Product ID `subscriptions.init(productId)`


```html 
<html>
  <head>
    <!-- 1. Include the swg client -->
    <script async type="application/javascript"
            src="https://news.google.com/swg/js/v1/swg.js"></script>

    <!-- 2. Add a client ready callback -->
    <script>
      (self.SWG = self.SWG || []).push( subscriptions => {
         // 3. Use a Publication ID (example.com) or a Product ID (example.com:premium)
         subscriptions.init(publicationOrProductId);
      });
    </script>
  </head>
  <body>
    <p>Your article content</p>
  </body>
</html>
```