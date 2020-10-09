import { httpGet, httpPost, httpDelete } from './http';

export async function getJob(id) {
  return httpGet(`job/${id}`);
}

export async function saveJob(item) {
  return httpPost('job', item);
}

export async function deleteJob(id) {
  return httpDelete(`job/${id}`);
}

export async function listJob() {
  return httpGet('job');
}

export async function searchJob(query) {
  return httpPost('job/search', query);
}

export async function signJobDoc(id, fileIds) {
  return httpPost(`job/${id}/sign`, {files: fileIds});
}

export async function generateJob(jobTemplateId, portfolioId) {
  return httpPost('job/generate', {jobTemplateId, portfolioId});
}

export async function assignJob(jobId, agentId) {
  return httpPost(`job/${jobId}/assign`, { agentId });
}

export async function listJobNotifies(jobId, from, size = 20) {
  return httpGet(`job/${jobId}/notify`, { from, size });
}

export async function markJobNotifyRead(jobId) {
  return httpPost(`job/${jobId}/notify/read`);
}

export async function notifyJob(jobId, msg) {
  const content = msg?.trim();
  if (!content) return;
  return httpPost(`job/${jobId}/notify`, { content });
}

export async function completeJob(jobId) {
  return httpPost(`job/${jobId}/complete`);
}