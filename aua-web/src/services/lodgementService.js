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

export async function generateLodgement(item) {
  return httpPost('lodgement/generate', item);
}

export async function assignLodgement(lodgementId, agentId) {
  return httpPost(`lodgement/${lodgementId}/assign`, { agentId });
}

export async function logLodgement(lodgementId, event, extra) {
  return httpPost(`lodgement/${lodgementId}/log/${event}`, extra || undefined);

}