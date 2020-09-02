import { httpGet, httpPost, httpDelete } from './http';



export async function searchFile(ids) {
  return httpPost('file/search', {ids});
}

export async function downloadFile(id) {
  return httpGet(`file/download/${id}`);
}
