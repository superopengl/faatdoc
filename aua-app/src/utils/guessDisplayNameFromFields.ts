import * as _ from 'lodash';

export function guessDisplayNameFromFields(fields) {
  const fieldMap = _.keyBy(fields || [], 'name');
  const [givenName, surname, company] = ['givenName', 'surname', 'company'].map(k => fieldMap[k]?.value || '');
  const fullname = `${givenName} ${surname}`.trim();
  return fullname || company || 'Unnamed';
}
