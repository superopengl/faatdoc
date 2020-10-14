import { httpGet, httpPost, request } from './http';

export async function getFile(id) {
  return httpGet(`file/${id}`);
}

export async function searchFile(ids) {
  return ids?.length ? httpPost('file/search', { ids }) : [];
}

export async function downloadFile(jobId, fileId) {
  if (!jobId || !fileId) throw new Error('Missing jobId and fileId');
  return request('GET', `file/download/job/${jobId}/file/${fileId}`, null, null, 'blob');
}

export async function openFile(jobId, fileId) {
  const data = await downloadFile(jobId, fileId);
  const fileUrl = URL.createObjectURL(data);
  window.open(fileUrl);
}