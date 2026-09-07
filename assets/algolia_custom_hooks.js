document.addEventListener("algolia.hooks.initialize", () => {
	algoliaShopify.hooks.registerHook(
		"beforeInstantSearchProductTemplate",
		(_defaultTemplate, hit, html, components, trackSearchAttribution) => html`
      <div
        class="ais-hit ais-product"
        data-algolia-index="${hit.index}"
        data-algolia-position="${hit.productPosition}"
        data-algolia-queryid="${hit.queryID}"
        data-algolia-objectid="${hit.objectID}"
        data-handle="${hit.handle}"
        data-variant-id="${hit.objectID}"
        data-distinct="${hit._distinct}"
        data-product-id="${hit.id}"
        onClick="${() => trackSearchAttribution(hit)}"
      >
        <img
          class="ais-hit--picture"
          src="${algoliaShopify.helpers.mediumImage(hit)}"
          alt="${hit.title} - ${hit.variant_title}"
        />

        <div class="ais-hit--details">
          <p class="ais-hit--title">
            <a
              data-algolia-index="${hit.index}"
              data-algolia-position="${hit.productPosition}"
              data-algolia-queryid="${hit.queryID}"
              data-algolia-objectid="${hit.objectID}"
              href="${algoliaShopify.helpers.instantsearchLink(hit)}"
              title="${algoliaShopify.helpers.fullTitle(
								hit.title,
								hit._distinct,
								hit.variant_title,
							)}"
            >
              ${components.Highlight({ attribute: "title", hit })}
              ${algoliaShopify.helpers.variantTitleAddition(hit, hit._distinct)}
            </a>
          </p>
          <p
            class="ais-hit--subtitle"
            title="${hit.product_type}${algoliaShopify.translation_helpers.by(
							hit.vendor,
						)}"
          >
            ${components.Highlight({ attribute: "product_type", hit })}
            ${
							hit.vendor &&
							html`
                <span> ${algoliaShopify.translations.by} </span>
              `
						}
            ${hit.vendor && components.Highlight({ attribute: "vendor", hit })}
          </p>
          <p class="ais-hit--price">
            <b>${algoliaShopify.helpers.displayPrice(hit, hit._distinct)}</b>
            ${
							!hit._distinct &&
							html`
                <span class="ais-hit--price-striked"
                  ><span
                    >${algoliaShopify.helpers.displayStrikedPrice(
											hit.price,
											hit.compare_at_price,
										)}</span
                  ></span
                >
              `
						}
            ${
							!hit._distinct &&
							html`
                <span class="ais-hit--price-discount"
                  >${algoliaShopify.helpers.displayDiscount(
										hit.price,
										hit.compare_at_price,
										hit.price_ratio,
									)}</span
                >
              `
						}
          </p>
          <!-- Extra info examples - Remove the display: none to show them -->
          <p class="ais-hit--info" style="display: none">
            ${
							hit.sku &&
							html`
                <span class="algolia-sku"
                  >${components.Highlight({ attribute: "sku", hit })}</span
                >
              `
						}
            ${
							hit.barcode &&
							html`
                <span class="algolia-barcode"
                  >${components.Highlight({ attribute: "barcode", hit })}</span
                >
              `
						}
            ${
							hit.weight &&
							html`
                <span class="algolia-weight">${hit.weight}</span>
              `
						}
            ${
							!hit.taxable &&
							html`
                <span class="algolia-taxable"
                  >${algoliaShopify.translations.taxFree}</span
                >
              `
						}
          </p>
          <!-- Tags example - Remove the display: none to show them -->
          <p class="ais-hit--tags" style="display: none">
            ${hit?._highlightResult.tags?.map(
							(tag) =>
								html`
                  <span class="ais-hit--tag">${tag.value}</span>
                `,
						)}
          </p>
          ${
						!hit._distinct &&
						html`
              <form
                id="algolia-add-to-cart-${hit.objectID}"
                style="display: none;"
                action="/cart/add"
                method="post"
                enctype="multipart/form-data"
              >
                <input type="hidden" name="id" value="${hit.objectID}" />
              </form>
              <p class="ais-hit--cart">
                ${
									hit.can_order
										? html`
                      <button
                        class="ais-hit--cart-button"
                        data-form-id="algolia-add-to-cart-${hit.objectID}"
                      >
                        ${algoliaShopify.translations.addToCart}
                      </button>
                    `
										: html`
                      <button
                        class="ais-hit--cart-button ais-hit--cart-button__disabled"
                      >
                        ${algoliaShopify.translations.outOfStock}
                      </button>
                    `
								}
              </p>
            `
					}
        </div>
      </div>
    `,
	);
});