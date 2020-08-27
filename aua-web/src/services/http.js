import * as axios from 'axios';
import * as _ from 'lodash';
import { logout } from './authService';
import { notify } from 'util/notify';
import { WindowsFilled } from '@ant-design/icons';

axios.defaults.withCredentials = true;

function trimSlash(str) {
  return str ? str.replace(/^\/+/, '').replace(/\/+$/, '') : str;
}

function trimTrailingSlash(str) {
  return str ? str.replace(/\/+$/, '') : str;
}

export const baseURL = trimTrailingSlash(process.env.REACT_APP_AUA_API_ENDPOINT);


function getHeaders(responseType) {
  const headers = {
    'Content-Type': responseType === 'json' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
  };

  return headers;
}

export async function request(method, path, queryParams, body, responseType = 'json') {
  try {
    const response = await axios({
      method,
      // baseURL,
      url: `${baseURL}/${trimSlash(path)}`,
      headers: getHeaders(responseType),
      params: queryParams,
      data: body,
      responseType
    });

    return response.data;
  } catch (e) {
    const code = _.get(e, 'response.status', null);
    if (code === 401) {
      notify.error('Session timeout.');
      Window.location = '/';
      return;
    }
    const errorMessage = _.get(e, 'response.data.message', e.message);
    notify.error('Error', errorMessage);
    console.error(e.response);
    throw e;
  }
}

export const httpGet = async (path, queryParams = null) => request('GET', path, queryParams);
export const httpPost = async (path, body, queryParams = null) => request('POST', path, queryParams, body);
export const httpPut = async (path, body, queryParams = null) => request('PUT', path, queryParams, body);
export const httpDelete = async (path, body = null, queryParams = null) => request('DELETE', path, queryParams, body);
