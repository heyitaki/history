//===== PAGE SAVE =====
chrome.commands.onCommand.addListener(function(command) {
  switch (command) {
    case 'save':
      savePage();
      saveCurrentUrl();
  }
});

function saveCurrentUrl() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (tabs.length > 0) {
      var url = tabs[0].url;
      var title = tabs[0].title;
      chrome.storage.sync.get({urlToTitleDict:{}}, function(data) {
        urlToTitleDict = data.urlToTitleDict;
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
  entity = data.selectionText;
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (tabs.length > 0) {
      var tab = tabs[0];
      chrome.storage.sync.get({urlToEntityDict:{}}, function(data) {
        urlToEntityDict = data.urlToEntityDict;
        if (!(tab.url in urlToEntityDict)) {
          urlToEntityDict[tab.url] = [entity];
        } else if (urlToEntityDict[tab.url].indexOf(entity) < 0) {
          entityList = urlToEntityDict[tab.url];
          entityList.push(entity);
          urlToEntityDict[tab.url] = entityList;
        }

        chrome.storage.sync.set({urlToEntityDict:urlToEntityDict});
      });
    }
  });        
}