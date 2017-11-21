chrome.storage.sync.get({entityHighlighting:false}, (data) => {
  if (!data.entityHighlighting) {
		$(document).unmark({
			iframes: true
		});
	}
});
