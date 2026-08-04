# Launch (Tags): track Register and Buy now clicks

This site marks CTAs with **`data-cta="register"`** and **`data-cta="buy"`** on every article page so you can build **Click** rules on stable CSS selectors.

```html
<button type="button" class="btn btn-secondary" data-cta="register">Register</button>
<button type="button" class="btn btn-primary" data-cta="buy">Buy now</button>
```

Selectors for Data Collection:

- Register: `button[data-cta="register"]`
- Buy now: `button[data-cta="buy"]`

---

## 1. Deploy the HTML

Push or publish your site so the buttons include `data-cta`. Then **rebuild and publish** your Tags library to the environment your site uses (Development / Production).

---

## 2. Create two rules in Data Collection

Open **Data Collection** → your **Tag property** → **Rules**.

### Rule A — Register click

1. **Add rule** → name e.g. `CTA — Register click`.
2. **Events** → **Add**:
   - **Extension:** Core  
   - **Event type:** Click  
   - Configure **specific elements** (wording may vary):
     - **Element selector / CSS selector:** `button[data-cta="register"]`  
     - If the UI offers “only when clicked” / bubble, leave defaults so the button click fires the rule.
3. **Actions** → **Add**:
   - **Extension:** Adobe Experience Platform Web SDK  
   - **Action type:** Send event  

   Configure the event so your **datastream and XDM schema** receive a clear signal. Typical options:

   **Option 1 — Send event (recommended if your UI supports XDM JSON)**  
   - Set **XDM** to include a **web interaction** (names vary by Web SDK extension version), for example:
     - Link / interaction **name:** `register_cta` or `Register`
     - **Type:** `other` or `download` per your standard  

   Use a **Data element** (Custom code) if the Send event action expects a single data element that returns an XDM fragment — see Option 2.

   **Option 2 — Custom code action (works on almost all setups)**  
   - **Extension:** Core  
   - **Action type:** Custom code  
   - **Open editor** and use (default Alloy instance name is `alloy`):

   ```javascript
   alloy("sendEvent", {
     xdm: {
       eventType: "web.webinteraction.linkClicks",
       web: {
         webInteraction: {
           name: "register_cta",
           type: "other",
           linkClicks: {
             value: 1
           }
         },
         webPageDetails: {
           URL: window.location.href
         }
       }
     }
   });
   ```

   Keys under `web` use **camelCase** (`webInteraction`, `webPageDetails`) to match typical XDM payloads. If your schema uses different mixins, adjust to match **your** dataset.

   Adjust `eventType` and `web` fields to match **your** Experience Event schema and what your **dataset** accepts. If validation fails in the debugger, simplify to the minimum fields your schema requires or ask your admin which field group is enabled on the datastream.

### Rule B — Buy now click

> **Important — this is what makes the _Orders_ metric populate.**
> Register is a link click, but "Buy now" is a **conversion**. Content Analytics'
> **Orders** metric (and any commerce attribution back to the asset) comes from a
> **commerce purchase** experience event, **not** from `web.webInteraction.linkClicks`.
> If Buy now only sends a link-click event, Asset Views/Clicks/CTR/People will still
> populate but **Orders stays 0** — because no order ever entered the event stream.

Create this rule the same way as Rule A (**Events → Core → Click**, selector
`button[data-cta="buy"]`), but the **action must send a commerce purchase event**:

- **Name:** `CTA — Buy now click`
- **Click selector:** `button[data-cta="buy"]`
- **Actions → Add → Core → Custom code**, then:

```javascript
alloy("sendEvent", {
  xdm: {
    eventType: "commerce.purchases",
    commerce: {
      purchases: { value: 1 },
      order: {
        // Unique per order so CJA counts distinct orders.
        purchaseID: "demo-" + Date.now(),
        currencyCode: "USD",
        priceTotal: 49.00
      }
    },
    productListItems: [
      {
        SKU: "demo-sku-001",
        name: "Demo product",
        quantity: 1,
        priceTotal: 49.00
      }
    ],
    web: {
      webPageDetails: { URL: window.location.href }
    }
  }
});
```

Why each part matters:

- **`eventType: "commerce.purchases"`** + **`commerce.purchases.value: 1`** — this is
  what CJA reads as an **Order**. Without it the Orders column is always 0.
- **`commerce.order.purchaseID`** — a unique id per click so orders aren't de-duplicated.
- **`productListItems`** — optional but recommended; lets you report revenue/quantity.
- The asset is linked to this order **automatically**: because the purchase event fires
  on the article page (same page + same identity/People as the asset exposure),
  Content Analytics attributes the order to the asset that was viewed. You do **not**
  send the asset id yourself.

> **Datastream/schema requirement:** the datastream feeding your dataset must have a
> field group that includes the **Commerce** mixin (`commerce.purchases`,
> `commerce.order`) and, for revenue, **Product list items**. If Send-event/XDM
> validation fails, add the Commerce field group to the schema, or trim the payload to
> the commerce fields your schema already allows.

For a realistic demo, hardcoded values above are fine. To make price/SKU dynamic,
read them from `data-*` attributes on the button (e.g. `event.target.dataset.price`).

---

## 3. Save, build, publish

1. **Save** both rules.  
2. **Publishing** → add a new **library** → add your changes → **Build** → **Approve** (if required) → **Publish** to the **same environment** as your site’s Launch embed (`development` / `production`).

---

## 4. Validate

1. Open your live or local site with **Adobe Experience Platform Debugger**.  
2. Confirm the rule runs on click (Console / Logs, or rule names in Debugger if shown).  
3. In **Network**, look for requests to **Edge** (`adobedc.net` / `edge.adobedc.net` region hosts) when you click each button.  
4. In **AEP**, confirm rows in your **Experience Event** dataset with the expected `eventType` after processing delay — for Buy now, look for `eventType: "commerce.purchases"` with a `commerce.order.purchaseID`. That row is what shows up as an **Order** attributed to the asset in CJA Content Analytics.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Rule never fires | Selector typo; library not published to this environment; cached old library (hard refresh, incognito). |
| Send event fails XDM validation | Schema on the datastream doesn’t include `web.webInteraction`; use a **custom** `eventType` or fields your schema allows. |
| Multiple hits | Two rules both matching — ensure one rule per button with distinct selectors. |
| **Orders stays 0 / Infinity% but Asset Views work** | Buy now is sending a **link-click** event, not a **commerce purchase**. Use the `commerce.purchases` payload in Rule B. Also confirm the schema has the **Commerce** field group and the `purchaseID` is unique per click. |

---

## References

- [Web SDK tag extension — Send event](https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/web-sdk/event-types)  
- [Core extension — Click event](https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/core/overview)  
