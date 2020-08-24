
export function displayNameAsLabel(name) {
  try{
  return name?.replace(/_+/g, ' ');
  }catch(e){
    debugger;
  }
}
