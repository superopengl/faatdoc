import { httpGet, httpPost } from './http';

export async function getProfile() {
  return httpGet(`user/profile`);
}

export async function saveProfile(profile) {
  return httpPost(`user/profile`, profile);
}

export async function changePassword(password, newPassword) {
  return httpPost(`user/change_password`, { password, newPassword });
}


