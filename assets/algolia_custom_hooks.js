document.addEventListener("algolia.hooks.initialize",
  function () {
    algoliaShopify.hooks.registerHook(
      "beforeAutocompleteOptions",
      function (options) {
        console.log(options)
      },
    );
  }
);