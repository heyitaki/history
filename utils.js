function savePage() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (tabs.length > 0) {
      var tab = tabs[0];
      chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function(data) {
        var url = URL.createObjectURL(data);
        var fileName = constructFileName(tab.url);
        chrome.downloads.download({
            url: url,
            filename: fileName
        });
      });
    }
  });
}

function constructFileName(url) {
  //return text.replace(/[^a-z0-9_\- ()\[\]]/gi, '');
  return sha256(url) + ".mhtml";
}