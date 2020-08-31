import * as _ from 'lodash';

export function guessDisplayNameFromFields(fields) {
  const fieldMap = _.keyBy(fields || [], 'name');
  const [givenName, surname, company] = ['givenName', 'surname', 'company'].map(k => fieldMap[k]?.value || '');
  const fullname = `${givenName} ${surname}`;
  const displayName = fullname.trim() ? fullname : company;
  return displayName || 'Unnamed';
}
