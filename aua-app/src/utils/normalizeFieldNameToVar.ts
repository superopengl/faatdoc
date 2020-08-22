const upperCaseWordsRegex = /^(tfn|abn|acn)$/i;

export function normalizeFieldNameToVar(name) {
  return name?.split(/ +/g)
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .map(w => upperCaseWordsRegex.test(w) ? w.toUpperCase() : w)
  .join('_');
}
