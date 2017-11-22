document.addEventListener('DOMContentLoaded', function() {
  chrome.commands.onCommand.addListener((command) => {
    switch (command) {
      case 'save':
        //savePage();
        saveCurrentUrl(() => {
          clearElement('#savedUrls');
          loadUrls();
        });
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
  chrome.storage.sync.get({recentPagesList:[]}, (data) => {
    const recentPagesList = data.recentPagesList;
    chrome.storage.sync.get({urlToTitleDict:{}}, (data) => {
      const urlToTitleDict = data.urlToTitleDict;
      for (let i = recentPagesList.length-1; i >= Math.max(0, recentPagesList.length-5); i--) {
        writeUrlToDom(recentPagesList[i], null, urlToTitleDict[recentPagesList[i]]);
      } 
    });
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
  chrome.storage.sync.get({recentEntitiesList:[]}, (data) => {
    const recentEntitiesList = data.recentEntitiesList;
    chrome.storage.sync.get({urlToEntityDict:{}}, (data) => {
      const urlToEntityDict = data.urlToEntityDict;
      for (let i = recentEntitiesList.length-1; i >= Math.max(0, recentEntitiesList.length-5); i--) {
        writeEntityToDom(recentEntitiesList[i], urlToEntityDict[recentEntitiesList[i]]);
      } 
    });
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
  if (window.confirm('Are you sure you want to clear your history? This will delete all current saved entities.')) {
    clearElement("#savedUrls");
    clearElement("#savedEntities");
    chrome.storage.sync.remove("urlToTitleDict");
    chrome.storage.sync.remove("urlToEntityDict");
    chrome.storage.sync.remove("recentPagesList");
    chrome.storage.sync.remove("recentEntitiesList");
  }
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