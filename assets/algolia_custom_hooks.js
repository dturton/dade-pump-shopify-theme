document.addEventListener("algolia.hooks.initialize",
  function () {
    algoliaShopify.hooks.registerHook(
      "beforeInstantSearchAsyncFunction",
      function (options) {
        console.log('algolia init' + JSON.stringify(options))
      },
    );
  }
);