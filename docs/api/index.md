

## Contents

**Module Members**

- [renderToc()](#renderToc)
- [renderPdf()](#renderPdf)
- [renderOffscreen()](#renderOffscreen)

## Module Members

#### <a id="renderToc"></a>renderToc( targetElementSelector, headingSelector=h1, )

Renders a basic table of contents for the given `headingSelector`. By default only `h1` and `h2` tags are included
in the table of contents. Each entry results in a `li` element with an `a` element as child. The HTML content of the
link will be set to the `innerHTML` property of the respective heading.
In case a heading element already has a value for the `id` attribute, this will be used for the link. Otherwise an
id is created using the current `textContent` of the heading concatenated with its index in the list of matched
headings. The resulting HTML fragment is then rendered into the element found for the `targetElementSelector`. Hence
this should either be an `ul` or `ol` element.
Each `li` will receive a CSS class name `level-` with the node name of the heading element appended. For example a
toc entry for a `h2` heading element will receive the css class `level-h2`.

To prevent specific headings from appearing in the table of contents, they can be marked with a `data-toc-ignore`
attribute.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| targetElementSelector | `String` |  selector for the element to append the toc to (should be `ul` or `ol`) |
| _headingSelector=h1,_ | `String` |  h2]    selector for heading elements to create toc entries for |

#### <a id="renderPdf"></a>renderPdf( parentSelector, src )

Embeds an external PDF file as single image per page. This is specific to PDFreactor and uses proprietary features to
read the number of available pages and select a page from the included PDF. Each page is rendered as an image into
the provided parent element. 

In order to achieve a seamless integration of the PDF into the current document flow, margins, paddings and size have
to be adjusted via CSS.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| parentSelector | `String` |  selector for the element the PDF pages should be appended to |
| src | `String` |  the source url for the pdf file |

#### <a id="renderOffscreen"></a>renderOffscreen( selector, renderFunction )

Helps rendering the contents of an SVG element off-screen (i.e. while the according DOM element is detached from its
parent node). Especially when creating a lot of SVG nodes, for example when rendering data-intensive charts, this 
improves performance dramatically.

The `renderFunction` will be called once while the SVG element is detached. It receives the following arguments:
- `svg`: the d3 selection for the SVG element
- `rect`: the result of calling `getBoundClientRect()` on the element
- `rendered`: a function to temporarily re-attach the element and call the callback provided to it. This is useful
  if an intermediate rendering is necessary, e.g. for calculation of layout information. The result of the callback
  passed to this function will be returned.

Example:
```js
renderOffscreen( '.some-wrapper > svg', ( svg, rect, rendered ) => {

   const arcPath = svg.append( 'path' )
      .attr( 'd', d3.arc() ... );
   const point = rendered( () => arcPath.node().getPointAtLength( length ) );
   // ... further stuff, where the point is needed
} );
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| selector | `String` |  selector for the SVG element whose contents should be rendered offscreen |
| renderFunction | `Function` |  the function doing the actual rendering |
