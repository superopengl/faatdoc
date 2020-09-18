import { httpGet, httpPost, httpDelete } from './http';

export async function getTask(id) {
  return httpGet(`task/${id}`);
}

export async function saveTask(item) {
  return httpPost('task', item);
}

export async function deleteTask(id) {
  return httpDelete(`task/${id}`);
}

export async function listTask() {
  return httpGet('task');
}

export async function listUnreadTask() {
  return httpGet('task/unread');
}


export async function searchTask(query) {
  return httpPost('task/search', query);
}

export async function signTask(id) {
  return httpPost(`task/${id}/sign`);
}

export async function generateTask(jobTemplateId, portofolioId) {
  return httpPost('task/generate', {jobTemplateId, portofolioId});
}

export async function assignTask(taskId, agentId) {
  return httpPost(`task/${taskId}/assign`, { agentId });
}

export async function listTaskNotifies(taskId, from, size = 20) {
  return httpGet(`task/${taskId}/notify`, { from, size });
}

export async function notifyTask(taskId, msg) {
  const content = msg?.trim();
  if (!content) return;
  return httpPost(`task/${taskId}/notify`, { content });
}

export async function completeTask(taskId) {
  return httpPost(`task/${taskId}/complete`);
}