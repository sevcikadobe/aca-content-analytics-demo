# Data layer (Adobe Client Data Layer) for the article pages

The article pages expose an **Adobe Client Data Layer (ACDL)** at
`window.adobeDataLayer` — the array-based, event-driven data layer that the Tags
**Adobe Client Data Layer** extension reads natively. Use it instead of the raw
`data-cta` selectors so your rules reference stable data, not DOM structure.

## What's on the page

Two pieces are defined in each article's `<head>`, **before** the Tags embed
(see [article.html](../article.html)):

```js
window.adobeDataLayer = window.adobeDataLayer || [];
window.acaPageData = {
  page:    { name: "…", category: "article", articleId: "article-1", language: "en" },
  product: { sku: "aca-guide-01", name: "…", price: 49.0, currency: "USD" }
};
window.adobeDataLayer.push({ event: "page.view", page: …, product: … });
```

CTA clicks are pushed by [js/datalayer.js](../js/datalayer.js).

## Events pushed

| Event | When | Payload (besides `event`) |
|-------|------|---------------------------|
| `page.view`    | On load | `page`, `product` |
| `cta.register` | Register clicked | `cta`, `product` |
| `cta.buy`      | Buy now clicked | `cta`, `product`, **`order`** |

The **`cta.buy`** push includes a ready-to-use order:

```js
order: {
  purchaseID: "demo-1722773773295",  // unique per click → distinct Orders in CJA
  currencyCode: "USD",
  priceTotal: 49.0
}
```

## Set it up in Tags

1. **Extensions → Catalog → Adobe Client Data Layer → Install.**
2. **Data Elements** — create one per field you need, type
   **Adobe Client Data Layer**, with the computed-state path:

   | Data element | Path |
   |--------------|------|
   | `dl.page.name`        | `page.name` |
   | `dl.product.sku`      | `product.sku` |
   | `dl.product.name`     | `product.name` |
   | `dl.product.price`    | `product.price` |
   | `dl.order.purchaseID` | `order.purchaseID` |
   | `dl.order.priceTotal` | `order.priceTotal` |
   | `dl.order.currency`   | `order.currencyCode` |

3. **Rules** — trigger on the data-layer events instead of CSS clicks:
   - **Event → Adobe Client Data Layer → “data layer computed state changes”**
     (or the ACDL event listener), and set the **event name** to `cta.buy`
     (or `cta.register`, `page.view`).

## Wire Buy now → commerce.purchases (fixes the Orders = 0 issue)

In the `cta.buy` rule, send the commerce event using the data elements above so
`commerce.order.purchaseID` is populated (an empty order is why Orders stayed 0 —
see [launch-cta-tracking.md](launch-cta-tracking.md)):

```javascript
alloy("sendEvent", {
  xdm: {
    eventType: "commerce.purchases",
    commerce: {
      purchases: { value: 1 },
      order: {
        purchaseID: _satellite.getVar("dl.order.purchaseID"),
        currencyCode: _satellite.getVar("dl.order.currency"),
        priceTotal: _satellite.getVar("dl.order.priceTotal")
      }
    },
    productListItems: [
      {
        SKU: _satellite.getVar("dl.product.sku"),
        name: _satellite.getVar("dl.product.name"),
        quantity: 1,
        priceTotal: _satellite.getVar("dl.product.price")
      }
    ],
    web: { webPageDetails: { URL: window.location.href } }
  }
});
```

> In the Web SDK **Send event** action you can also map these data elements
> directly into the XDM object instead of using custom code.

## Verify

Open the page and run in the console:

```javascript
window.adobeDataLayer.getState();      // computed page + product state
window.adobeDataLayer.push({ on: "cta.buy", handler: console.log });  // watch buys
```

`getState()` is added by the ACDL library once the Tags library loads. Then click
**Buy now** and confirm the outgoing Edge request carries `commerce.order.purchaseID`.
