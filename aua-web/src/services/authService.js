import { httpPost } from './http';
import { clearLocalStorage } from './localStorageService';

export async function login(name, password) {
  const data = { name, password };
  return httpPost(`auth/login`, data);
}

export async function signUp(user, type) {
  return httpPost(`auth/signup`, user, { type });
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

  clearLocalStorage('user', null);
  window.location = '/';
  // history.push('/');
}


