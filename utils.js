function savePage() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (tabs.length > 0) {
      var tab = tabs[0];
      chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function(data) {
        var url = URL.createObjectURL(data);
        var filename = constructFileName(tab.url);
        chrome.downloads.download({
            url: url,
            conflictAction:"overwrite",
            filename: filename,
            saveAs: false
        });
      });
    }
  });
}

function constructFileName(url) {
  //return text.replace(/[^a-z0-9_\- ()\[\]]/gi, '');
  return "./pages/" + sha256(url) + ".mhtml";
}