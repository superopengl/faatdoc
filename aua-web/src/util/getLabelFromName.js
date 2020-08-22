export function normalizeFieldNameToVar(name) {
  return name?.replace(/_+/g, ' ');
}
