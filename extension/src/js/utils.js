// Abbreviation for console.log()
function w() {
  if (console.log.apply) {
    console.log.apply(console, arguments);
  } else {
    console.log(arguments);
  }
}

function escapeRegExpInput(input){
  return input.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
}
