import { httpPost, httpGet } from './http';
import {reactLocalStorage} from 'reactjs-localstorage';

export async function login(name, password) {
  const data = { name, password };
  return httpPost(`auth/login`, data);
}

export async function signIn(user) {
  return httpPost(`auth/signin`, user);
}

export async function forgotPassword(email) {
  return httpPost(`auth/forgot_password`, { email });
}

export async function resetPassword(token, password) {
  return httpPost(`auth/reset_password`, { token, password });
}

export async function logout() {
  httpPost(`auth/logout`).catch(() => {});
}

export async function getAuthUser() {
  return httpGet(`auth/user`);
}

export async function impersonate(email) {
  return httpPost(`auth/impersonate`, { email });
}

export async function inviteUser(email) {
  return httpPost(`auth/invite`, { email });
}

export async function ssoGoogle(token) {
  return httpPost(`auth/sso/google`, { token });
}