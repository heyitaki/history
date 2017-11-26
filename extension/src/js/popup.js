document.addEventListener('DOMContentLoaded', function() {
  chrome.commands.onCommand.addListener((command) => {
    switch (command) {
      case 'save':
        //savePage();
        saveCurrentUrl(() => {
          clearElement('#savedPages');
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
  $("#toggleHighlight").click(toggleHighlight);

  // Clear history
  $("#clearHistory").click(clearHistory);

  // Copyright
  $("#copyright").html(`Copyright &copy; ${new Date().getFullYear()} Archer International Corporation`);
});

// ===== SAVE ENTITY =====
function loadEntities() {
  Promise.all([
    getDataAsync({recentEntitiesList:[]}, (data) => {
      return data.recentEntitiesList;
    }),
    getDataAsync({urlToEntityDict:{}}, (data) => {
      return data.urlToEntityDict;
    })
  ]).then((data) => {
    const [recentEntitiesList, urlToEntityDict] = data;
    if (recentEntitiesList.length === 0) {
      writePlaceholderToDom("No saved entities yet!", "#savedEntities");
      return "Wrote placeholder to DOM."
    }

    for (let i = recentEntitiesList.length-1; i >= Math.max(0, recentEntitiesList.length-5); i--) {
      writeEntityToDom(recentEntitiesList[i], urlToEntityDict[recentEntitiesList[i]]);
    }

    return `Wrote ${Math.min(5, recentEntitiesList.length)} entries to DOM.`;
  }).catch(console.log.bind(console));
}

function writeEntityToDom(url, entities) {
  const entitiesElement = createTextElement(entities.join(', '));
  const urlElement = createUrlElement(url);
  const listItem = createLiElement(entitiesElement, urlElement);
  $("#savedEntities").append(listItem);
}

// ===== SAVE PAGE =====
function loadUrls() { 
  Promise.all([
    getDataAsync({recentPagesList:[]}, (data) => {
      return data.recentPagesList;
    }),
    getDataAsync({urlToTitleDict:{}}, (data) => {
      return data.urlToTitleDict;
    })
  ]).then((data) => {
    const [recentPagesList, urlToTitleDict] = data;
    if (recentPagesList.length === 0) {
      writePlaceholderToDom("No saved pages yet!", "#savedPages");
      return "Wrote placeholder to DOM."
    }

    for (let i = recentPagesList.length-1; i >= Math.max(0, recentPagesList.length-5); i--) {
      writeUrlToDom(recentPagesList[i], urlToTitleDict[recentPagesList[i]]);
    }

    return `Wrote ${Math.min(5, recentPagesList.length)} entries to DOM.`;
  }).catch(console.log.bind(console));
}

function writeUrlToDom(url, title) {
  const titleElement = createTextElement(title);
  const urlElement = createUrlElement(url);
  const listItem = createLiElement(titleElement, urlElement);
  $("#savedPages").append(listItem);
}

// ===== SETTINGS =====
function clearHistory() {
  if (window.confirm("Are you sure you want to clear your history? This will delete all current saved entities.")) {
    clearElement("#savedPages");
    clearElement("#savedEntities");
    chrome.storage.sync.remove("urlToTitleDict");
    chrome.storage.sync.remove("urlToEntityDict");
    chrome.storage.sync.remove("recentPagesList");
    chrome.storage.sync.remove("recentEntitiesList");
    writePlaceholderToDom("No saved pages yet!", "#savedPages");
    writePlaceholderToDom("No saved entities yet!", "#savedEntities");
    executeScriptAsync('src/js/rm-highlight.js');
  }
}

function toggleHighlight() {
  getDataAsync({entityHighlighting:false}, (data) => {
    return !data.entityHighlighting;
  }).then((toggledVal) => {
    return setDataAsync('entityHighlighting', toggledVal);
  }).then((toggledVal) => {
    if (toggledVal) {
      return injectResourcesAsync(['src/js/async-operations.js']).then(() => {
        return executeScriptAsync('src/js/add-highlight.js');
      });
    } else {
      return executeScriptAsync('src/js/rm-highlight.js');
    }
  }).catch(console.log.bind(console));
}

// ===== HELPER =====
function createTextElement(text, unselectable=false) {
  const textElement = document.createElement('a');
  textElement.className = unselectable ? 'title unselectable' : 'title';
  textElement.text = text;
  return textElement;
}

function createUrlElement(url) {
  const urlElement = document.createElement('a');
  urlElement.className = 'urlcaption';
  urlElement.text = url;
  urlElement.setAttribute('href', url);
  urlElement.setAttribute('target', '_blank');
  urlElement.setAttribute('rel', 'noopener noreferrer');
  return urlElement;
}

function createLiElement() {
  const listItem = document.createElement('li'); 
  for (let arg of arguments) {
    listItem.append(arg);
  }

  return listItem;
}

function writePlaceholderToDom(placeholderText, dstElementId) {
  const textElement = createTextElement(placeholderText, true);
  const listItem = createLiElement(textElement);
  $(dstElementId).append(listItem);
}

function clearElement(elementId) {
  $(elementId).html("");
}