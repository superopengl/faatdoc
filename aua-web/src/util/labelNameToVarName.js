import * as _ from 'lodash';

export function labelNameToVarName(pascalCase) {
  for (const b of ['TFN', 'ABN', 'ACN']) {
    if (b === pascalCase) {
      return b.toLowerCase();
    }
  }
  const words = pascalCase.split(/ +/);
  const text = words.join('');
  return text.charAt(0).toLowerCase() + text.substring(1);
}
