import * as _ from 'lodash';


export const loadFromLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export const saveLocalStorage = (key, value) => {
  const data = value ? JSON.stringify(value) : null;
  localStorage.setItem(key, data);
}

export const clearLocalStorage = () => {
  localStorage.clear();
}

export const getAuthHeader = () => {
  const user = loadFromLocalStorage('user');
  const token = _.get(user, 'sessionId');
  return token ? { Authorization: token } : {};
}