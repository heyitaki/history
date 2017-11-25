const reader = new window.FileReader();

function saveCurrentUrl(callback) {
  getTabAsync().then((tab) => {
    return Promise.all([
      getDataAsync({urlToTitleDict:{}}, (data) => {
        const urlToTitleDict = data.urlToTitleDict;
        if (!(tab.url in urlToTitleDict)) {
          urlToTitleDict[tab.url] = tab.title;
        }

        return setDataAsync('urlToTitleDict', urlToTitleDict);
      }), 
      getDataAsync({recentPagesList:[]}, (data) => {
        const recentPagesList = data.recentPagesList;
        const urlIdx = recentPagesList.indexOf(tab.url);
        if (urlIdx >= 0) {
          recentPagesList.splice(urlIdx, 1);
        }

        recentPagesList.push(tab.url);
        return setDataAsync('recentPagesList', recentPagesList);
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