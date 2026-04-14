# Adobe Content Analytics — sandbox setup checklist

Use this checklist in your **AEP sandbox** where **CJA** and **Content Analytics** are provisioned. Complete steps in order; note IDs in the [Configuration log](#configuration-log) at the bottom.

## 1. Roles and access

- [ ] You can access **Adobe Experience Platform** (schemas, datasets, datastreams).
- [ ] You can access **Data Collection** (Tags — properties, rules, publishing).
- [ ] You can access **Customer Journey Analytics** and **Content Analytics** configuration.

If the guided wizard is blocked, resolve permissions first.

## 2. Guided configuration wizard

- [ ] Open Experience League: [Content Analytics guided configuration](https://experienceleague.adobe.com/en/docs/analytics-platform/using/content-analytics/configuration/guided) and follow the in-product **Content Analytics** guided flow.
- [ ] Remember: you typically have **one Content Analytics configuration per sandbox** — plan for a single demo config.
- [ ] When prompted, associate or confirm the **datastream** used for this implementation.
- [ ] Review prerequisites in [Configure Content Analytics](https://experienceleague.adobe.com/en/docs/analytics-platform/using/content-analytics/configuration/configuration), including:
  - Default Web SDK instance name **`alloy`** if you load the SDK via JavaScript for behavioral data.
  - Any **featurization** / user-agent allow-listing your org’s network or CDN requires.

Record in the configuration log:

- **Datastream ID:** `________________`
- **Sandbox name:** `________________`

## 3. Tags property and library publish

After the wizard **implements** configuration:

- [ ] Open **Data Collection** and locate the **Tags property** created or linked for Content Analytics.
- [ ] Add or verify **domains** allowed for your demo (localhost or your deployed host).
- [ ] **Build** a library, **submit** for approval if your workflow requires it, **approve**, and **publish** to the **environment** you will use (Development vs Production).
- [ ] Copy the **embed code** for that environment (script that belongs in `<head>`).

Per Adobe: you must **manually publish** the Tags property for data collection to match your configuration; configuration changes require **re-publish** to take effect.

References:

- [Content Analytics data collection](https://experienceleague.adobe.com/en/docs/analytics-platform/using/content-analytics/configuration/datacollection)
- [Adobe Content Analytics extension overview](https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/content-analytics/overview)

Record:

- **Tags property name:** `________________`
- **Environment (Dev / Staging / Prod):** `________________`

## 4. CJA connection and data view

- [ ] In **Customer Journey Analytics**, confirm the **connection** includes the dataset(s) your Content Analytics configuration uses.
- [ ] Confirm the **data view** exposes the fields needed for Content Analytics reporting (the guided flow reduces manual mapping).

## 5. Wire this demo site

The project ships with a **development** Tags embed in [`snippets/tags-head.html`](../snippets/tags-head.html) and in the `<head>` of `index.html` and `article.html` (keep all three identical).

- [ ] If you use a different environment or URL, replace the `<script src="…">` in **all three** places with the embed from **Data Collection → Property → Environments**.

The Tags loader URL is client-visible by design; treat internal org details in screenshots as sensitive.

## 6. Validate end-to-end

1. **Adobe Experience Platform Debugger** (browser extension): confirm the correct Tag property, library version, and rule/extension behavior.
2. **Assurance** (if you use it for Web SDK / Edge sessions): run a session against your demo URL.
3. **AEP**: confirm events land in the expected **dataset** (ingestion / batch indicators as appropriate).
4. **CJA / Content Analytics**: allow for processing latency; then confirm reports populate.

If reports are empty, common causes: unpublished library, wrong embed for the environment, wrong datastream, schema/dataset mismatch, or blocked featurization traffic.

### Console: `POST http://localhost:4001/api/` — `ERR_CONNECTION_REFUSED`

Your **Web SDK Edge domain** can be correct and you will still see this. It is **not** the Edge endpoint.

The **Adobe Content Analytics** extension ships **Profile Viewer**–related code in the Launch bundle. It picks an API base URL from the **page hostname**:

- If `window.location.href` contains **`localhost`** or starts with **`file:///`**, it uses **`http://localhost:4001/api`** (“dev” mode — intended for Adobe’s local builder tooling).
- Otherwise it uses Adobe demo hosts (e.g. `builder.adobedemo.com`), not port 4001.

Nothing is listening on `4001` in a normal local demo, so the POST fails. That call is ancillary to the Profile Viewer / builder integration; **analytics to Adobe Edge can still work**. You can safely **ignore** the console error, or avoid it:

- Open the site as **`http://127.0.0.1:8080`** (or another hostname that does **not** contain the string `localhost`) instead of `http://localhost:8080`.
- Or use a **real hostname** (staging URL, `/etc/hosts` entry like `aca.test` → `127.0.0.1`).

If you still see unexpected Edge traffic after that, then double-check **Web SDK** → **Edge domain** and **Custom code** rules as a secondary check.

### Dataset shows experiences but not assets

In Content Analytics, an **experience** is tied to the **page** (URL and parameters). An **asset** is an **image**, identified by its **image URL**. Your extension logs can show `assetUrlQualifier: ".*"` and ACA still only surfacing experience-level rows for two common reasons:

1. **Featurization cannot reach local image URLs**  
   Adobe’s pipeline **fetches** image URLs to build asset metadata (featurization). URLs like `http://127.0.0.1:8080/images/...` or `http://localhost:...` are **not reachable from Adobe’s servers**, so asset enrichment may be missing or delayed while **page-level** / experience events (e.g. `content.contentEngagement`) can still appear.  
   **What to do:** deploy the same site to **public HTTPS** (or use a tunnel such as Cloudflare Tunnel / ngrok) so the `<img src>` resolves to a URL Adobe can request. Retest after processing latency.

2. **Schema and UI**  
   In **AEP → Datasets → Preview**, expand the full **schema** (not only top-level `experiencecontent`). Asset-related fields may be nested or appear under separate groups; column names in the table view are often truncated—scroll horizontally or query in **Query Service** to list columns containing `asset`.

3. **Console rules**  
   Messages such as `Condition "Subdomain" for rule "Initialize Profile Viewer" was not met` refer to **Profile Viewer** / demo tooling, not the Edge pipeline. They do not by themselves explain missing assets; public image URLs and featurization are the usual fix for “experience only” locally.

4. **Page markup**  
   Use real `<img>` elements with a **200** response in the Network tab. Prefer `loading="eager"` (or no lazy load) on the hero image you care about so the asset is present when the library evaluates the page.

See [Configure Content Analytics](https://experienceleague.adobe.com/en/docs/analytics-platform/using/content-analytics/configuration/configuration) for featurization / allow-list requirements for your environment.

## Configuration log

| Item | Value |
|------|--------|
| Datastream ID | |
| Sandbox | |
| Tags property | |
| Tags environment | |
| Demo URL (local or hosted) | |
| Date validated in CJA | |

## Documentation index

1. [Configure Content Analytics](https://experienceleague.adobe.com/en/docs/analytics-platform/using/content-analytics/configuration/configuration)
2. [Content Analytics guided configuration](https://experienceleague.adobe.com/en/docs/analytics-platform/using/content-analytics/configuration/guided)
3. [Content Analytics data collection](https://experienceleague.adobe.com/en/docs/analytics-platform/using/content-analytics/configuration/datacollection)
4. [CJA: ingest via Web SDK](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-data-ingestion/ingest-use-guides/edge-network/aepwebsdk)
