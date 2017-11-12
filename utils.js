const reader = new window.FileReader();

function savePage() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (tabs.length > 0) {
      var tab = tabs[0];
      chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function(data) {
        console.log(data);
        var filename = constructFileName(tab.url);
        reader.readAsText(data);
      });
    }
  });
}

reader.addEventListener('loadend', (e) => {
  const text = e.srcElement.result;
  runPyScript('all-saved-pages', text, constructFileName(text));
});

function savePage1() {
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
  //return content.replace(/[^a-z0-9_\- ()\[\]]/gi, '');
  return sha256(url) + ".mhtml";
}

function runPyScript(bucket, data, dst_path) {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:5000/upload',
    dataType: 'jsonp',
    jsonpCallback: 'callback',
    crossDomain: true,
    async: false,
    data: { bucket: bucket, data: data, dst_path: dst_path }
  }).fail(function(jqXHR, status, error){ 
    console.log(jqXHR);
    console.log(status);
    console.log(error);
  })
}

function callback(result) {
  console.log('Server response: ' + result);
}
