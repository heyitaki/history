const reader = new window.FileReader();

function savePage() {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      chrome.pageCapture.saveAsMHTML({tabId: tab.id}, (data) => {
        const filename = constructFileName(tab.url);
        reader.readAsText(data);
      });
    }
  });
}

reader.addEventListener('loadend', (e) => {
  const text = e.srcElement.result;
  runPyScript(text, constructFileName(text));
});

function constructFileName(url) {
  return sha256(url) + ".mhtml";
}

function runPyScript(data, dst_path) {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:5000/upload',
    dataType: 'jsonp',
    async: false,
    data: { data: data, dst_path: dst_path }
  }).fail(function(jqXHR, status, error){ 
    console.log(jqXHR, status, error);
  })
}

function callback(result) {
  console.log('Server response: ' + result);
}

function clearElement(id) {
  $(id).html("");
}