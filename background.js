chrome.commands.onCommand.addListener(function(command) {
  console.log(command);
  switch (command) {
    case 'save':
      console.log('hello');
      savePage();
      saveCurrentUrl();
      console.log(runPyScript('1', '2', '3'));
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

function runPyScript(bucket, src_path, dst_path){
  console.log('run python script BEGIN');
  var jqXHR = $.ajax({
    type: 'POST',
    url: 'http://localhost:5000/',
    crossDomain: true,
    async: false,
    dataType: 'jsonp',
    data: { bucket: bucket, src_path: src_path, dst_path: dst_path }
  });

  jqXHR.done(function(result){
    console.log('JQXHR start');
    console.log(result);
    console.log('JQXHR end');
    alert(result);
  });

  return jqXHR.responseText;
}