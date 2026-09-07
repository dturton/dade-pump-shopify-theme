const sleep = (ms, hookName) =>
	new Promise((resolve) => {
		console.log("sleeping for ", ms, hookName);
		setTimeout(resolve, ms);
	});
    
document.addEventListener("algolia.hooks.initialize", () => {
	algoliaShopify.hooks.registerHook(
		"beforeInstantSearchAsyncFunction",
		async () => {
			console.log(
				"----------- beforeInstantSearchAsyncFunction started ----------------",
			);
			await sleep(1000, "beforeInstantSearchAsyncFunction");
		},
	)
});