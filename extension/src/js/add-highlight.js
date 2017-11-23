chrome.storage.sync.get({entityHighlighting:false}, (data) => {
  if (data.entityHighlighting) {
    chrome.storage.sync.get({urlToEntityDict:{}}, (data) => {
      const urlToEntityDict = data.urlToEntityDict;
      const url = document.location.href;
      if (url in urlToEntityDict) {
        const entities = urlToEntityDict[url];
        const regex = new RegExp(`\\b(${entities.join('|')})\\b`, 'i');
        $(document).markRegExp(regex, {
          acrossElements: true,
          separateWordSearch: false,
          iframes: true
        });
      }
    });
  }
});