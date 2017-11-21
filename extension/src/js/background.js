//===== PAGE SAVE =====
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'save':
      //savePage();
      saveCurrentUrl();
  }
});

function saveCurrentUrl() {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      const title = tabs[0].title;
      chrome.storage.sync.get({urlToTitleDict:{}}, (data) => {
        const urlToTitleDict = data.urlToTitleDict;
        if (!(url in urlToTitleDict)) {
          urlToTitleDict[url] = title;
          chrome.storage.sync.set({urlToTitleDict:urlToTitleDict});
        }
      });
    }
  });
}

//===== ENTITY SELECTION =====
chrome.contextMenus.create({
  title: "Save '%s' as entity", 
  contexts:["selection"], 
  onclick: saveEntity,
});

function saveEntity(data) {
  const entity = data.selectionText;
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      chrome.storage.sync.get({urlToEntityDict:{}}, (data) => {
        const urlToEntityDict = data.urlToEntityDict;
        if (!(tab.url in urlToEntityDict)) {
          urlToEntityDict[tab.url] = [entity];
        } else if (urlToEntityDict[tab.url].indexOf(entity) < 0) {
          const entityList = urlToEntityDict[tab.url];
          entityList.push(entity);
          urlToEntityDict[tab.url] = entityList;
        }

        chrome.storage.sync.set({urlToEntityDict:urlToEntityDict}, function() {
          chrome.tabs.executeScript(null, {
            file: "src/js/content.js",
            allFrames: true
          });
        });
      });
    }
  });       
}