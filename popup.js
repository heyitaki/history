document.addEventListener('DOMContentLoaded', function() {
  chrome.commands.onCommand.addListener(function(command) {
    console.log(command);
    switch (command) {
      case 'save':
        savePage();
        saveCurrentUrl();
    }
  });

  loadUrls();
  loadEntities();  

  // Remove scrollbar
  var styleElement = document.createElement('style');
  styleElement.id = 'remove-scroll-style';
  styleElement.textContent =
      'html::-webkit-scrollbar{display:none !important}' +
      'body::-webkit-scrollbar{display:none !important}';
  document.getElementsByTagName('body')[0].appendChild(styleElement);

  // Accordion menu
  $(function() {
    var Accordion = function(el, multiple) {
      this.el = el || {};
      this.multiple = multiple || false;
      var headers = this.el.find('.menu-header');
      headers.on('click', {el: this.el, multiple: this.multiple}, this.dropdown);
    };

    Accordion.prototype.dropdown = function(e) {
      var $el = e.data.el,
        $this = $(this),
        $next = $this.next();

      $next.slideToggle();
      $this.parent().toggleClass('open');

      if (!e.data.multiple) {
        $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
      };
    } 

    var accordion = new Accordion($('.accordion'), false);
  });

  // Copyright
  var year = new Date().getFullYear();
  $("#copyright").html("Copyright &copy; " + year + " Archer International Corporation");
});

//===== SAVE PAGE =====
function loadUrls() {
  chrome.storage.sync.get({urlToTitleDict:{}}, function(data) {
    var urlToTitleDict = data.urlToTitleDict;
    var dictKeys = Object.keys(urlToTitleDict);
    if (dictKeys.length > 0) {
      for (var i = Math.max(0, dictKeys.length-1); i >= Math.max(0, dictKeys.length-5); i--) {
        writeUrlToDom(dictKeys[i], urlToTitleDict[dictKeys[i]]);
      } 
    }
  });
}

function saveCurrentUrl() {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (tabs.length > 0) {
      var tab = tabs[0];
      chrome.storage.sync.get({urlToTitleDict:{}}, function(data) {
        var urlToTitleDict = data.urlToTitleDict;
        if (Object.keys(urlToTitleDict).indexOf(tab.url) < 0) {
          urlToTitleDict[tab.url] = tab.title;
          chrome.storage.sync.set({urlToTitleDict:urlToTitleDict});

        }
      });
    }
  });
}

function writeUrlToDom(url, title) {
  var titleElement = document.createElement('a');
  titleElement.text = title;

  var urlElement = document.createElement('a');
  urlElement.className = 'urlcaption';
  urlElement.text = url;
  urlElement.setAttribute('href', url);
  urlElement.setAttribute('target', '_blank');
  urlElement.setAttribute('rel', 'noopener noreferrer');

  
  var listEntry = document.createElement('li');
  listEntry.appendChild(titleElement);
  listEntry.appendChild(urlElement);

  var urlHash = sha256(url);
  listEntry.setAttribute('id', urlHash);
  $("#" + urlHash).click(function() {
    $(this).remove();
    removeUrl(url);
  });

  $("#savedUrls").append(listEntry);
}

function removeUrl(url) {
  chrome.storage.sync.get({urlToEntityDict:{}}, function(data) {
    var urlToEntityDict = data.urlToEntityDict;
    var idx = Object.keys(urlToEntityDict).indexOf(url);
    if (idx >= 0) {
      urlToEntityDict[url] = undefined;
    }

    chrome.storage.sync.set({urlToEntityDict:urlToEntityDict});
  });
}

//===== SAVE ENTITY =====
function loadEntities() {
  chrome.storage.sync.get({urlToEntityDict:{}}, function(data) {
    var urlToEntityDict = data.urlToEntityDict;
    var dictKeys = Object.keys(urlToEntityDict);
    if (dictKeys.length > 0) {
      for (var i = Math.max(0, dictKeys.length-1); i >= Math.max(0, dictKeys.length-5); i--) {
        writeEntityToDom(dictKeys[i], urlToEntityDict[dictKeys[i]]);
      } 
    }
  });
}

function writeEntityToDom(url, entities) {
  var entitiesElement = document.createElement('a');
  entitiesElement.text = entities.join(', ');

  var urlElement = document.createElement('a');
  urlElement.className = 'urlcaption';
  urlElement.text = url;
  urlElement.setAttribute('href', url);
  urlElement.setAttribute('target', '_blank');
  urlElement.setAttribute('rel', 'noopener noreferrer');

  var listEntry = document.createElement('li');
  listEntry.appendChild(entitiesElement);
  listEntry.appendChild(urlElement);

  $("#savedEntities").append(listEntry);
}

//===== SETTINGS =====
function clearElement(id) {
  $(id).html("");
}