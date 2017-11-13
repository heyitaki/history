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
      chrome.storage.sync.get({urlList:[]}, function(data) {
        urlList = data.urlList;
        if (urlList.indexOf(url) === -1) {
          urlList.push(url);
          chrome.storage.sync.set({urlList:urlList});
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
  console.log('saving ' + entity);
  chrome.storage.sync.get({entityList:[]}, function(data) {
    entityList = data.entityList;
    if (entityList.indexOf(entity) === -1) {
      entityList.push(entity);
      chrome.storage.sync.set({entityList:entityList});
    }
  });        
}