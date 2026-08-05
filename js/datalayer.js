/*
  Adobe Client Data Layer (ACDL) wiring for the demo article pages.

  `window.adobeDataLayer` and `window.acaPageData` are initialized in each page
  <head> (before the Tags embed) so the data layer exists when Launch loads.
  This file only adds the *event* pushes for CTA clicks.

  In Tags: add the "Adobe Client Data Layer" extension and listen for these events:
    - "page.view"    → page + product state is available on load
    - "cta.register" → Register button clicked
    - "cta.buy"      → Buy now clicked (includes an `order` for commerce.purchases)

  Reference computed-state paths as data elements, e.g.:
    page.name, page.category, product.sku, product.name, product.price,
    order.purchaseID, order.priceTotal, order.currencyCode
*/
(function () {
  window.adobeDataLayer = window.adobeDataLayer || [];

  function currentProduct() {
    return (window.acaPageData && window.acaPageData.product) || {};
  }

  function pushCta(type, label) {
    var product = currentProduct();
    var data = {
      event: type === "buy" ? "cta.buy" : "cta.register",
      cta: { type: type, label: label },
      product: product
    };

    if (type === "buy") {
      // Unique order id per click so CJA counts distinct Orders (empty/duplicate
      // purchaseIDs are why the Orders metric stays at 0).
      data.order = {
        purchaseID: "demo-" + Date.now(),
        currencyCode: product.currency || "USD",
        priceTotal: product.price || 0
      };
    }

    window.adobeDataLayer.push(data);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cta]");
    if (!btn) return;
    pushCta(btn.getAttribute("data-cta"), (btn.textContent || "").trim());

    // Optional walkthrough navigation: continue to the next lesson after the
    // conversion event is pushed. A short delay gives the Web SDK time to send
    // the beacon before the page unloads.
    var navTo = btn.getAttribute("data-nav-to");
    if (navTo) {
      setTimeout(function () {
        window.location.href = navTo;
      }, 300);
    }
  });
})();
