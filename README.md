# Adobe Content Analytics demo

Minimal multi-page static site for exercising **Content Analytics** in **Customer Journey Analytics** with data sent through **Experience Platform Data Collection** (Tags + Web SDK on Edge) into your **AEP sandbox**.

## Quick start

From the project root:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/](http://localhost:8080/) and browse **Home** and **Article 1–3**.

If the console shows `POST http://localhost:4001/api/` failing, that comes from Content Analytics’ Profile Viewer code when the URL contains `localhost`. Use [http://127.0.0.1:8080/](http://127.0.0.1:8080/) instead to silence it, or ignore it — see **Console: POST localhost:4001** in [docs/adobe-content-analytics-setup.md](docs/adobe-content-analytics-setup.md).

Alternatively:

```bash
npx --yes serve -p 8080 .
```

## Adobe Tags

The site loads the **development** library from Data Collection (`launch-…-development.min.js`) in [snippets/tags-head.html](snippets/tags-head.html) and in the `<head>` of each HTML page, kept in sync.

If you switch environments or republish, update **every page** plus `snippets/tags-head.html` with the new `<script src="…">` from **Data Collection → Property → Environments**. Initial setup and publish steps are in [docs/adobe-content-analytics-setup.md](docs/adobe-content-analytics-setup.md).

## CTA click tracking (Launch)

Article pages use `data-cta="register"` and `data-cta="buy"`. To send those clicks to Edge with the Web SDK, follow [docs/launch-cta-tracking.md](docs/launch-cta-tracking.md).

## Validate

Use **Adobe Experience Platform Debugger**, then confirm dataset activity in **AEP** and reports in **CJA / Content Analytics**. See section 6 in [docs/adobe-content-analytics-setup.md](docs/adobe-content-analytics-setup.md).

## Files

| Path | Purpose |
|------|--------|
| `index.html`, `article.html`, `article2.html`, `article3.html` | Demo pages with Tags embed |
| `snippets/tags-head.html` | Reference copy of the Tags `<script>` (keep in sync with pages) |
| `docs/adobe-content-analytics-setup.md` | Sandbox checklist, publish, validation |
| `css/styles.css` | Simple layout |
| `images/` | Shared article image (`article-asset.jpg` on all article pages) |
