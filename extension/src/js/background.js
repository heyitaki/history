//===== PAGE SAVE =====
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'save':
      //savePage();
      saveCurrentUrl();
  }
});

//===== ENTITY SELECTION =====
chrome.contextMenus.create({
  title: "Save '%s' as entity", 
  contexts:["selection"], 
  onclick: saveEntity,
});

function saveEntity(data) {
  let entity = data.selectionText;
  if (!entity) {
    return;
  }

  entity = escapeRegExpInput(entity);
  getTabAsync().then((tab) => {
    return Promise.all([
      getDataAsync({urlToEntityDict:{}}, (data) => {
        const urlToEntityDict = data.urlToEntityDict;
        if (!(tab.url in urlToEntityDict)) {
          urlToEntityDict[tab.url] = [entity];
        } else if (urlToEntityDict[tab.url].indexOf(entity) < 0) {
          const entityList = urlToEntityDict[tab.url];
          entityList.push(entity);
          urlToEntityDict[tab.url] = entityList;
        }

        return setDataAsync('urlToEntityDict', urlToEntityDict);
      }),
      getDataAsync({recentEntitiesList:[]}, (data) => {
        const recentEntitiesList = data.recentEntitiesList;
        const urlIdx = recentEntitiesList.indexOf(tab.url);
        if (urlIdx >= 0) {
          recentEntitiesList.splice(urlIdx, 1);
        }

        recentEntitiesList.push(tab.url);
        return setDataAsync('recentEntitiesList', recentEntitiesList);
      })
    ]);
  }).then((value) => {
    return injectResourcesAsync(['src/js/async-operations.js']).then(() => {
      return executeScriptAsync('src/js/add-highlight.js');
    });
  }).catch(console.log.bind(console));
}
