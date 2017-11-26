Promise.all([
  getDataAsync({entityHighlighting:false}, (data) => {
    return data.entityHighlighting;
  }),
  getDataAsync({urlToEntityDict:{}}, (data) => {
    return data.urlToEntityDict;
  })
]).then((data) => {
  const [entityHighlighting, urlToEntityDict] = data;
  if (entityHighlighting) {
    const url = document.location.href;
    if (url in urlToEntityDict) {
      const escapedSearchStr = urlToEntityDict[url].map(escapeRegExpInput).join('|');
      const regex = new RegExp(`\\b(${escapedSearchStr})\\b`, 'i');
      $(document).markRegExp(regex, {
        acrossElements: true,
        separateWordSearch: false,
        iframes: true
      });
    }
  }
}).catch(console.log.bind(console));

function escapeRegExpInput(input){
  return input.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
}