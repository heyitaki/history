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
      for (var i = Math.max(0, urlList.length-1); i >= Math.max(0, urlList.length-5); i--) {
        writeUrlToDom(urlList[i]);
      } 
    }
  });

  chrome.storage.sync.get({entityList:[]}, function(data) {
    entityList = data.entityList;
    if (entityList.length > 0) {
      for (var i = Math.max(0, entityList.length-1); i >= Math.max(0, entityList.length-5); i--) {
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

  // Accordion menu
  $(function() {
    var Accordion = function(el, multiple) {
      this.el = el || {};
      this.multiple = multiple || false;
      var links = this.el.find('.link');
      links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown);
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
    removeEntity(entity);
  });
}

function removeEntity(entity) {
  chrome.storage.sync.get({entityList:[]}, function(data) {
    entityList = data.entityList;
    var idx = entityList.indexOf(entity);
    if (idx >= 0) {
      entityList.splice(idx, 1);
    }
    chrome.storage.sync.set({entityList:entityList});
  });
}

function clear() {
  $("#savedUrls").html("");
  chrome.storage.sync.clear();
}