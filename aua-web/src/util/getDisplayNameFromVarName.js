
export function getDisplayNameFromVarName(camelCase) {
  try {
    const bigCase = camelCase?.toUpperCase();
    for(const b of ['TFN', 'ABN', 'ACN']) {
      if(b === bigCase){
        return b;
      }
    }
    const spaceSplitted = camelCase?.replace(/([A-Z])/g, ' $1');
    return spaceSplitted.charAt(0).toUpperCase() + spaceSplitted.substring(1);
  } catch (e) {
    debugger;
  }
}


