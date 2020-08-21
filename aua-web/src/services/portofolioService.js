import { httpGet, httpPost, httpDelete } from './http';

export async function getPortofolio(id) {
  return httpGet(`portofolio/${id}`);
}

export async function savePortofolio(portofolio) {
  return httpPost('portofolio', portofolio);
}

export async function deletePortofolio(id) {
  return httpDelete(`portofolio/${id}`);
}

export async function listPortofolio() {
  return httpGet('portofolio');
}
