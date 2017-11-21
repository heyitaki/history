chrome.storage.sync.get({urlToEntityDict:{}}, (data) => {
  const urlToEntityDict = data.urlToEntityDict;
  const url = document.location.href;
  if (url in urlToEntityDict) {
    const entities = urlToEntityDict[url];
    const regex = new RegExp('\\b(' + entities.join('|') + ')\\b', 'i');
    $(document).markRegExp(regex, {
      acrossElements: true,
      separateWordSearch: false,
      iframes: true
    });
  }
});

// HIGHLIGHT METHOD #2
// $(document).mark(entities, {
//   "separateWordSearch": false,
//   "accuracy": {
//     "value": "exactly",
//     "limiters": [",", ".", ";"]
//   }
// });

// HIGHLIGHT METHOD #1
// chrome.storage.sync.get({urlToEntityDict:{}}, (data) => {
//   const urlToEntityDict = data.urlToEntityDict;
//   const url = document.location.href;
//   console.log(url in urlToEntityDict);
//   if (url in urlToEntityDict) {
//     const entities = urlToEntityDict[url];
//     console.log('entities', entities);
//     const regex = new RegExp('\\b(' + entities.join('|') + ')\\b');
//     console.log('regex', regex);
//     const elements = document.getElementsByTagName('*');
//     for (let i = 0; i < elements.length; i++) {
//       for (let j = 0; j < elements[i].childNodes.length; j++) {
//         let currNode = elements[i].childNodes[j];
//         if (currNode.nodeType === 3) {
//           for (let match; match = regex.exec(currNode.nodeValue); ) {
//             let hlElement = document.createElement('span');
//             hlElement.appendChild(document.createTextNode(match[0]));
//             hlElement.className = 'highlight';

//             let nextNode = currNode.splitText(match.index);
//             nextNode.nodeValue = nextNode.nodeValue.substring(match[0].length);
//             currNode.parentNode.insertBefore(hlElement, nextNode);
//             currNode = nextNode;
//           }
//         }
//       }
//     }
//   }
// });