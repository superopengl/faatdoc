
import {capitalize} from 'lodash';

export function varNameToLabelName(camelCase) {
  try {
    const bigCase = camelCase?.toUpperCase();
    if(['TFN', 'ABN', 'ACN'].includes(bigCase)) {
      return bigCase;
    }

    const spaceSplitted = camelCase?.replace(/([A-Z])/g, ' $1');
    const words = spaceSplitted.split(/ +/g).map(capitalize);
    return words.join(' ');
  } catch (e) {
    debugger;
  }
}

