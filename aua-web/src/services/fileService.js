import { httpGet, httpPost, httpDelete } from './http';



export async function searchFile(ids) {
  return httpPost('file/search', {ids});
}

