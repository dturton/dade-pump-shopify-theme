# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Shopify storefront theme for **dade-pump** (motor & pump sales, service, and repair in Miami, FL). This is a customization of Shopify's **Dawn** theme (v15.4.1 — see `config/settings_schema.json` `theme_info`). Dawn is Shopify's reference theme; upstream docs/structure at https://shopify.dev/docs/storefronts/themes apply.

There is no build system, package manager, or test suite. Files in this repo are uploaded as-is to Shopify, which serves the Liquid/CSS/JS directly.

## Workflow

All development happens through the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli/theme):

- `shopify theme dev` — Run a local preview server against a dev store. Hot-reloads changes.
- `shopify theme push` — Upload working copy to a theme on the connected store (use `--unpublished` for an unpublished theme, `--live` to publish).
- `shopify theme pull` — Download theme files from the store (use this to sync changes made in the Shopify admin theme editor back into the repo).
- `shopify theme check` — Lint Liquid/JSON (theme-check).

The `.shopify/` directory holds CLI state (notably `metafields.json`, the schema of product/variant/shop metafields the theme relies on) — do not hand-edit unless syncing with admin.

## Architecture

Shopify themes follow a fixed directory contract — Shopify loads files by location, not imports, so filenames matter.

- **`layout/theme.liquid`** — The HTML wrapper rendered on every non-password page. `layout/password.liquid` wraps the password page.
- **`templates/*.json`** — Page templates. Each maps to a Shopify resource type (`product.json`, `collection.json`, `cart.json`, `index.json`, etc.) and is a JSON document listing which sections to render and their settings/blocks. Alternate templates use the `resource.suffix.json` naming convention and can be assigned to individual products/pages/collections from the admin — examples in this repo:
  - `product.hidden-price-product.json` — product page with price hidden, replaced with "Add to cart for price" (used for products requiring quote).
  - `collection.brand-collection.json` — collection page variant.
  - `page.default-repair.json` — the repair-request contact page.
- **`sections/*.liquid`** — Reusable, merchant-configurable blocks referenced from templates. Each section file declares its own `{% schema %}` (settings, blocks, presets) at the bottom — editing this schema changes what merchants see in the theme editor. `*-group.json` files (`header-group.json`, `footer-group.json`) are section groups rendered via `{% sections 'name' %}` in the layout.
- **`snippets/*.liquid`** — Partials included via `{% render 'snippet-name' %}`. No schema, not merchant-configurable. Prefer snippets for logic reused across sections.
- **`assets/`** — Flat directory of all CSS/JS/SVG/fonts. Referenced from Liquid with `{{ 'file.css' | asset_url | stylesheet_tag }}` or `{{ 'file.js' | asset_url }}`. No bundler — each file is served on its own. Component CSS files follow `component-*.css` naming and are loaded on-demand by the sections that need them. JS is vanilla ES modules / custom elements (see `global.js`, `cart.js`, `cart-drawer.js`, etc.); no framework.
- **`config/settings_schema.json`** — Global theme settings shown in the theme editor's "Theme settings" panel. `config/settings_data.json` holds the current values (this file is overwritten whenever a merchant saves settings in the admin — avoid manual edits that conflict with admin state). `config/markets.json` holds per-market overrides.
- **`locales/*.json`** — Translation strings. `en.default.json` is the source; `*.schema.json` variants translate editor-facing schema labels. Liquid uses `{{ 'namespace.key' | t }}`.

### Data flow — how a page renders

1. Request hits Shopify → Shopify picks `templates/<type>[.<suffix>].json` based on the resource and any assigned template suffix.
2. `layout/theme.liquid` renders; `{{ content_for_header }}` and `{{ content_for_layout }}` are injected by the platform.
3. `{{ content_for_layout }}` expands each section listed in the template's JSON in the declared `order`. Each section reads its own settings + blocks from that JSON and renders its Liquid.
4. Section groups in the layout (`{% sections 'header-group' %}`) pull from the corresponding `sections/*-group.json`.

### Metafields

`.shopify/metafields.json` is the schema contract between this theme and the store's product data. Notable custom namespaces the theme reads:
- `custom.breakdown_parts` (list of metaobject references) — used on product pages.
- Many `shopify.*` standard taxonomy metafields (power source, fuel supply, phase type, etc.) — reflect the pump/motor/generator domain.
- `shopify--discovery--product_recommendation.*` — drives the related-products section.

When adding theme code that reads a new metafield, add it to `.shopify/metafields.json` so the CLI keeps it in sync with the store.

### Dawn conventions worth knowing

- Sections use custom elements (e.g. `<product-info>`, `<cart-drawer>`) defined in `assets/*.js`. Liquid renders the HTML; the custom element wires up behavior on `connectedCallback`.
- Cart updates use Shopify's Section Rendering API — JS posts to `/cart/*.js` with a `sections=` param and swaps the returned HTML into the DOM (see `assets/cart.js`, `assets/cart-drawer.js`).
- Color schemes are a Dawn abstraction: sections have a `color_scheme` setting; CSS variables flip based on the selected scheme group defined in `settings_schema.json`.
