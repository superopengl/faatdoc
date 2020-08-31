import * as _ from 'lodash';

export function getVarNameFromDisplayName(pascalCase) {
  for (const b of ['TFN', 'ABN', 'ACN']) {
    if (b === pascalCase) {
      return b.toLowerCase();
    }
  }
  const words = pascalCase.split(/ +/);
  words[0] = _.capitalize(words[0]);
  return words.join('');
}
