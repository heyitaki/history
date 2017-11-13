var urlList = [];

document.addEventListener('DOMContentLoaded', function() {
  chrome.commands.onCommand.addListener(function(command) {
    console.log(command);
    switch (command) {
      case 'save':
        savePage();
        saveCurrentUrl();
    }
  });

  chrome.storage.sync.get({urlList:[]}, function(data) {
    urlList = data.urlList;
    if (urlList.length > 0) {
      for (var i = Math.max(0, urlList.length-1); i >= Math.max(0, urlList.length-10); i--) {
        writeUrlToDom(urlList[i]);
      } 
    }
  });

  chrome.storage.sync.get({entityList:[]}, function(data) {
    entityList = data.entityList;
    if (entityList.length > 0) {
      for (var i = Math.max(0, entityList.length-1); i >= Math.max(0, entityList.length-10); i--) {
        writeEntityToDom(entityList[i]);
      } 
    }
  });

  // Remove scrollbar
  var styleElement = document.createElement('style');
  styleElement.id = 'remove-scroll-style';
  styleElement.textContent =
      'html::-webkit-scrollbar{display:none !important}' +
      'body::-webkit-scrollbar{display:none !important}';
  document.getElementsByTagName('body')[0].appendChild(styleElement);
});

function saveCurrentUrl() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    url = tabs[0].url;
    if (urlList.indexOf(url) === -1) {
      urlList.push(url);
      saveUrlList();
      writeUrlToDom(url);
    }
  });
}

function removeUrl(url) {
  chrome.storage.sync.get({urlList:[]}, function(data) {
    urlList = data.urlList;
    var idx = urlList.indexOf(url);
    if (idx >= 0) {
      urlList.splice(idx, 1);
    }
    saveUrlList();
  });
}

function saveUrlList(callback) {
  chrome.storage.sync.set({urlList:urlList}, callback);
}

function writeUrlToDom(url) {
  var urlLink = document.createElement('a');
  urlLink.text = url;
  urlLink.setAttribute('href', url);
  urlLink.setAttribute('target', '_blank');
  urlLink.setAttribute('rel', 'noopener noreferrer');

  var urlHash = sha256(url);
  var urlEntry = document.createElement('li');
  urlEntry.appendChild(urlLink);
  urlEntry.setAttribute('id', urlHash);
  $("#savedUrls").append(urlEntry);

  $("#" + urlHash).click(function() {
    $(this).remove();
    removeUrl(url);
  });
}

function writeEntityToDom(entity) {
  var entityText = document.createElement('a');
  entityText.text = entity;

  var entityEntry = document.createElement('li');
  entityEntry.appendChild(entityText);
  entityHash = sha256(entity);
  entityEntry.setAttribute('id', entityHash);

  $("#savedEntities").append(entityEntry);
  $("#" + entityHash).click(function() {
    $(this).remove();
    removeUrl(url);
  });
}

function clear() {
  $("#savedUrls").html("");
  chrome.storage.sync.clear();
}