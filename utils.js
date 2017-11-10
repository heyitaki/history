function savePage() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (tabs.length > 0) {
      var tab = tabs[0];
      chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function(data) {
        var url = URL.createObjectURL(data);
        var filename = constructFileName(tab.url);
        chrome.downloads.download({
            url: url,
            conflictAction: "overwrite",
            filename: filename,
            saveAs: false
        });
        filename = filename.substring(8);
        runPyScript('all-saved-pages', '~/Downloads/pages/c97299b933a8189e05284334cfef80a870e55d99fe69f7df7497c1122dc0540c.mhtml', filename);
      });
    }
  });
}

function constructFileName(url) {
  //return text.replace(/[^a-z0-9_\- ()\[\]]/gi, '');
  return "./pages/" + sha256(url) + ".mhtml";
}

function runPyScript(bucket, src_path, dst_path) {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:5000/upload',
    dataType: 'jsonp',
    jsonpCallback: 'callback',
    crossDomain: true,
    async: false,
    data: { bucket: bucket, src_path: src_path, dst_path: dst_path }
  }).fail(function(jqXHR, status, error){ 
    console.log(jqXHR);
    console.log(status);
    console.log(error);
  }).done(function(result){
    console.log(result);
  });
}

function callback(result) {
  console.log(result);
}

