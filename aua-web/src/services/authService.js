import { httpPost, httpGet } from './http';

export async function login(name, password) {
  const data = { name, password };
  return httpPost(`auth/login`, data);
}

export async function signUp(user) {
  return httpPost(`auth/signup`, user);
}

export async function forgotPassword(email) {
  return httpPost(`auth/forgot_password`, { email });
}

export async function resetPassword(token, password) {
  return httpPost(`auth/reset_password`, { token, password });
}

export async function logout() {
  await new Promise(async (resolve) => {
    setTimeout(() => resolve(), 1000);
    try {
      await httpPost(`auth/logout`);
      resolve();
    } catch { }
  })

  window.location = '/';
}

export async function getAuthUser() {
  return httpGet(`auth/user`);
}


