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

Duplicate Rule A and change:

- **Name:** `CTA — Buy now click`
- **Click selector:** `button[data-cta="buy"]`
- In Custom code (if used), change `name` to e.g. `buy_now_cta`

---

## 3. Save, build, publish

1. **Save** both rules.  
2. **Publishing** → add a new **library** → add your changes → **Build** → **Approve** (if required) → **Publish** to the **same environment** as your site’s Launch embed (`development` / `production`).

---

## 4. Validate

1. Open your live or local site with **Adobe Experience Platform Debugger**.  
2. Confirm the rule runs on click (Console / Logs, or rule names in Debugger if shown).  
3. In **Network**, look for requests to **Edge** (`adobedc.net` / `edge.adobedc.net` region hosts) when you click each button.  
4. In **AEP**, confirm rows in your **Experience Event** dataset with the expected `eventType` / `web.webInteraction` fields after processing delay.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Rule never fires | Selector typo; library not published to this environment; cached old library (hard refresh, incognito). |
| Send event fails XDM validation | Schema on the datastream doesn’t include `web.webInteraction`; use a **custom** `eventType` or fields your schema allows. |
| Multiple hits | Two rules both matching — ensure one rule per button with distinct selectors. |

---

## References

- [Web SDK tag extension — Send event](https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/web-sdk/event-types)  
- [Core extension — Click event](https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/core/overview)  
