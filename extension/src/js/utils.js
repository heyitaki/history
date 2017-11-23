// ===== PAGE SAVE =====
const reader = new window.FileReader();

function saveCurrentUrl(callback) {
  getTabAsync().then((tab) => {
    return Promise.all([
      getDataAsync({urlToTitleDict:{}}, (data) => {
        const urlToTitleDict = data.urlToTitleDict;
        if (!(tab.url in urlToTitleDict)) {
          urlToTitleDict[tab.url] = tab.title;
        }

        return setDataAsync({urlToTitleDict:urlToTitleDict});
      }), 
      getDataAsync({recentPagesList:[]}, (data) => {
        const recentPagesList = data.recentPagesList;
        const urlIdx = recentPagesList.indexOf(tab.url);
        if (urlIdx >= 0) {
          recentPagesList.splice(urlIdx, 1);
        }

        recentPagesList.push(tab.url);
        return setDataAsync({recentPagesList:recentPagesList});
      })
    ]);
  }).then((value) => {
    callback();
  }).catch(console.log.bind(console));
}

function savePage() {
  getTabAsync().then((tab) => {
    chrome.pageCapture.saveAsMHTML({tabId: tab.id}, (data) => {
      reader.readAsText(data);
    });
  }).catch(console.log.bind(console));
}

reader.addEventListener('loadend', (e) => {
  const text = e.srcElement.result;
  runPyScript(text, constructFileName(text));
});

function constructFileName(url) {
  return `${sha256(url)}.mhtml`;
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

// ===== ASYNC =====
function getDataAsync(getObj, callback) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(getObj, (data) => {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      return resolve(callback(data));
    });
  });
}

function setDataAsync(setObj) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(setObj, () => {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      return resolve('Success!');
    });
  });
}

function getTabAsync() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
      const err = chrome.runtime.lastError;
      if (err) { return reject(err); }
      if (tabs.length > 0) { return resolve(tabs[0]); }
      return reject('No active tab to retrieve.');
    });
  });
}

// ===== UTILS =====
function w() {
  if (console.log.apply) {
    console.log.apply(console, arguments);
  } else {
    console.log(arguments);
  }
}
