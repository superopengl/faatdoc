import { httpGet, httpPost, httpDelete } from './http';

export async function getLodgement(id) {
  return httpGet(`lodgement/${id}`);
}

export async function saveLodgement(item) {
  return httpPost('lodgement', item);
}

export async function deleteLodgement(id) {
  return httpDelete(`lodgement/${id}`);
}

export async function listLodgement() {
  return httpGet('lodgement');
}

export async function searchLodgement(query) {
  return httpPost('lodgement/search', query);
}

export async function signLodgement(id) {
  return httpPost(`lodgement/${id}/sign`);
}

export async function generateLodgement(jobTemplateId, portofolioId) {
  return httpPost('lodgement/generate', {jobTemplateId, portofolioId});
}

export async function assignLodgement(lodgementId, agentId) {
  return httpPost(`lodgement/${lodgementId}/assign`, { agentId });
}

export async function listLodgementMessages(lodgementId, from, size = 20) {
  return httpGet(`lodgement/${lodgementId}/message`, { from, size });
}

export async function sendLodgementMessage(lodgementId, msg) {
  const content = msg?.trim();
  if (!content) return;
  return httpPost(`lodgement/${lodgementId}/message`, { content });
}

export async function completeLodgement(lodgementId) {
  return httpPost(`lodgement/${lodgementId}/complete`);
}