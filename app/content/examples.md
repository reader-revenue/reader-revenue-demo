# Content samples

### Examples of different content types and callouts
---

### HTML article

Authoring an html article is like authoring a normal html page, except you just
need to focus on the contents of the `<body>`.

#### HTML article example

```html
<h1>Hello There</h1>
<article>
  <p>Helpful article content</p>
</article>
```

!!! hint **Custom pages**
If you need a truly custom page (including the header), you can create
a custom handlebars template. See documentation (TODO) for how to do this.
!!!

### Markdown article

The markdown renderer supports the standard information in
[github-flavored markdown](https://marked.js.org/using_advanced#options),
using [marked.js](https://marked.js.org) as the renderer. The following plugins
are also available for use:

#### Plugins {#markdown-renderer-plugins}

- [Admonition](https://www.npmjs.com/package/marked-admonition-extension) for
callouts
- [Custom Heading Id](https://www.npmjs.com/package/marked-custom-heading-id)
for adding custom ids to headings
- [highlight.js](https://www.npmjs.com/package/marked-highlight) for code
syntax highlighting

Standard <code>html</code> <em>tags</em> can also be used within markdown docs.

The markdown code for this section is as follows:

#### Markdown article example

!!! hint **Purposefully unformatted**
This section is purposefully not parsed as markdown in the example doc,so as to
illustrate the markdown format.
!!!

```markdown
The markdown renderer supports the standard information in
[github-flavored markdown](https://marked.js.org/using_advanced#options),
using [marked.js](https://marked.js.org) as the renderer. The following plugins
are also available for use:

#### Plugins {#markdown-renderer-plugins}
- [Admonition](https://www.npmjs.com/package/marked-admonition-extension) for
callouts
- [Custom Heading Id](https://www.npmjs.com/package/marked-custom-heading-id)
for adding custom ids to headings
- [highlight.js](https://www.npmjs.com/package/marked-highlight) for code
syntax highlighting

Standard <code>html</code> <em>tags</em> can also be used within markdown docs.
```

## Code Samples

```
Default code sample
```

```html
<h1>html code sample</h1>
```

```javascript
console.log("javascript code sample")
```


## Callouts

### Syntax

To create a callout, the syntax is as per the `admonition` library.

```markdown
!!! <type> <optional message>
<optional body>
!!!
```

In its simplest form, only two lines are necessary, e.g. 
in this example for an **abstract** callout:

```markdown
!!! abstract demo for **abstract**
!!!
```

As rendered:

!!! abstract demo for **abstract** 
!!!

### Examples

!!! abstract demo for **abstract** bonus edition
This 'abstract' callout also illstrates what happens to multi-line comments
 that should wrap and have correct padding, but the comment needs to be
 long to wrap. /shrug
!!!

!!! attention demo for **attention**
content for **attention**
!!!

!!! bug demo for **bug**
content for **bug**
!!!

!!! caution demo for **caution**
content for **caution**
!!!

!!! danger demo for **danger**
content for **danger**
!!!

!!! error demo for **error**
content for **error**
!!!

!!! example demo for **example**
content for **example**
!!!

!!! failure demo for **failure**
content for **failure**
!!!

!!! hint demo for **hint**
content for **hint**
!!!

!!! info demo for **info**
content for **info**
!!!

!!! note demo for **note**
content for **note**
!!!

!!! question demo for **question**
content for **question**
!!!

!!! quote demo for **quote**
content for **quote**
!!!

!!! success demo for **success**
content for **success**
!!!

!!! tip demo for **tip**
content for **tip**
!!!

!!! warning demo for **warning**
content for **warning**
!!!
