document.addEventListener('DOMContentLoaded', function() {
  chrome.commands.onCommand.addListener((command) => {
    switch (command) {
      case 'save':
        //savePage();
        saveCurrentUrl();
    }
  });

  // Remove scrollbar
  const styleElement = document.createElement('style');
  styleElement.id = 'remove-scroll-style';
  styleElement.textContent =
      'html::-webkit-scrollbar{display:none !important}' +
      'body::-webkit-scrollbar{display:none !important}';
  document.getElementsByTagName('body')[0].appendChild(styleElement);

  // Accordion menu
  $(() => {
    function Accordion(el, multiple) {
      this.el = el || {};
      this.multiple = multiple || false;
      const headers = this.el.find('.menu-header');
      headers.on('click', {el: this.el, multiple: this.multiple}, this.dropdown);
    };

    Accordion.prototype.dropdown = function(e) {
      const $el = e.data.el,
        $this = $(this),
        $next = $this.next();

      $next.slideToggle();
      $this.parent().toggleClass('open');

      if (!e.data.multiple) {
        $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
      };
    } 

    const accordion = new Accordion($('.accordion'), false);
  });

  // Populate menu
  loadUrls();
  loadEntities();  

  // Toggle entity highlighting
  $("#toggle-highlight").click(toggleHighlight);

  // Clear history
  $("#clear-history").click(clearHistory);

  // Copyright
  $("#copyright").html("Copyright &copy; " + new Date().getFullYear() + " Archer International Corporation");
});

//===== SAVE PAGE =====
function loadUrls() { 
  chrome.storage.sync.get({urlToTitleDict:{}}, (data) => {
    const urlToTitleDict = data.urlToTitleDict;
    const dictKeys = Object.keys(urlToTitleDict);
    if (dictKeys.length > 0) {
      for (let i = dictKeys.length-1; i >= Math.max(0, dictKeys.length-5); i--) {
        writeUrlToDom(dictKeys[i], null, urlToTitleDict[dictKeys[i]]);
      } 
    }
  });
}

function saveCurrentUrl() {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      chrome.storage.sync.get({urlToTitleDict:{}}, (data) => {
        const urlToTitleDict = data.urlToTitleDict;
        if (Object.keys(urlToTitleDict).indexOf(tab.url) < 0) {
          urlToTitleDict[tab.url] = tab.title;
          chrome.storage.sync.set({urlToTitleDict:urlToTitleDict});
          writeUrlToDom(tab.url, tab.favIconUrl, tab.title);
        }
      });
    }
  });
}

function writeUrlToDom(url, iconUrl, title) {
  const favIcon = document.createElement('span');
  favIcon.src = iconUrl;

  const titleElement = document.createElement('a');
  titleElement.text = title;

  const urlElement = document.createElement('a');
  urlElement.className = 'urlcaption';
  urlElement.text = url;
  urlElement.setAttribute('href', url);
  urlElement.setAttribute('target', '_blank');
  urlElement.setAttribute('rel', 'noopener noreferrer');
  
  const listEntry = document.createElement('li');
  listEntry.appendChild(favIcon);
  listEntry.appendChild(titleElement);
  listEntry.appendChild(urlElement);

  const urlHash = sha256(url);
  listEntry.setAttribute('id', urlHash);
  $("#" + urlHash).click(function() {
    $(this).remove();
    removeUrl(url);
  });

  $("#savedUrls").append(listEntry);
}

function removeUrl(url) {
  chrome.storage.sync.get({urlToEntityDict:{}}, (data) => {
    const urlToEntityDict = data.urlToEntityDict;
    const idx = Object.keys(urlToEntityDict).indexOf(url);
    if (idx >= 0) {
      urlToEntityDict[url] = undefined;
    }

    chrome.storage.sync.set({urlToEntityDict:urlToEntityDict});
  });
}

//===== SAVE ENTITY =====
function loadEntities() {
  chrome.storage.sync.get({urlToEntityDict:{}}, (data) => {
    const urlToEntityDict = data.urlToEntityDict;
    const dictKeys = Object.keys(urlToEntityDict);
    if (dictKeys.length > 0) {
      for (let i = dictKeys.length-1; i >= Math.max(0, dictKeys.length-5); i--) {
        writeEntityToDom(dictKeys[i], urlToEntityDict[dictKeys[i]]);
      } 
    }
  });
}

function writeEntityToDom(url, entities) {
  const entitiesElement = document.createElement('a');
  entitiesElement.text = entities.join(', ');

  const urlElement = document.createElement('a');
  urlElement.className = 'urlcaption';
  urlElement.text = url;
  urlElement.setAttribute('href', url);
  urlElement.setAttribute('target', '_blank');
  urlElement.setAttribute('rel', 'noopener noreferrer');

  const listEntry = document.createElement('li');
  listEntry.appendChild(entitiesElement);
  listEntry.appendChild(urlElement);

  $("#savedEntities").append(listEntry);
}

//===== SETTINGS =====
function clearHistory() {
  clearElement("#savedUrls");
  clearElement("#savedEntities");
  chrome.storage.sync.remove("urlToTitleDict");
  chrome.storage.sync.remove("urlToEntityDict");
}

function toggleHighlight() {
  // TODO: 3 storage calls to add highlight, check if only 2 necessary
  chrome.storage.sync.get({entityHighlighting:false}, (data) => {
    const entityHighlighting = !data.entityHighlighting;
    chrome.storage.sync.set({entityHighlighting:entityHighlighting}, () => {
      if (entityHighlighting) {
        chrome.tabs.executeScript(null, {
          file: "src/js/add-highlight.js",
          allFrames: true
        });
      } else {
        chrome.tabs.executeScript(null, {
          file: "src/js/rm-highlight.js",
          allFrames: true
        });
      }
    });
  });
}