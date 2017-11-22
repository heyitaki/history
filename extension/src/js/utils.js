// ===== PAGE SAVE =====
const reader = new window.FileReader();

function saveCurrentUrl(callback) {
  console.log('saving current url');
  console.log('callback', callback); 
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      const title = tabs[0].title;

      Promise.all([
        getDataAsync({urlToTitleDict:{}}, (data) => {
          console.log('pages data', data);
          const urlToTitleDict = data.urlToTitleDict;
          if (!(url in urlToTitleDict)) {
            urlToTitleDict[url] = title;
          }

          return setDataAsync({urlToTitleDict:urlToTitleDict});
        }), 
        getDataAsync({recentPagesList:[]}, (data) => {
          console.log('recent data', data);
          const recentPagesList = data.recentPagesList;
          const urlIdx = recentPagesList.indexOf(url);
          if (urlIdx >= 0) {
            recentPagesList.splice(urlIdx, 1);
          }

          recentPagesList.push(url);
          return setDataAsync({recentPagesList:recentPagesList});
        })
      ]).then((value) => {
        callback();
      });
    }
  });
}

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
  }).fail((jqXHR, status, error) => { 
    console.log(jqXHR, status, error);
  });
}

// function callback(result) {
//   console.log('Server response: ' + result);
// }

// ===== SETTINGS =====
function clearElement(id) {
  $(id).html("");
}

// ===== ASYNC OPS =====
function getDataAsync(getObj, callback) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(getObj, function(data) {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      return resolve(callback(data));
    });
  });
}

function setDataAsync(setObj) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.set(setObj, function() {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      return resolve('Success!');
    });
  });
}