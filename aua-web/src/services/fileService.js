import { httpGet, httpPost, request } from './http';

export async function getFile(id) {
  return httpGet(`file/${id}`);
}

export async function searchFile(ids) {
  return ids?.length ? httpPost('file/search', { ids }) : [];
}

export async function downloadFile(id) {
  return request('GET', `file/download/${id}`, null, null, 'blob');
}

export async function openFile(id) {
  const data = await downloadFile(id);
  const fileUrl = URL.createObjectURL(data);
  window.open(fileUrl);
}