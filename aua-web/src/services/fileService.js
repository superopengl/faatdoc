import { httpGet, httpPost } from './http';

export async function getFile(id) {
  return httpGet(`file/${id}`);
}

export async function searchFile(ids) {
  return httpPost('file/search', {ids});
}

export async function downloadFile(id) {
  return httpGet(`file/download/${id}`);
}
