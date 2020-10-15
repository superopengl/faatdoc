import { httpGet, httpPost, httpDelete } from './http';

export async function getJobTemplate(id) {
  return httpGet(`job_template/${id}`);
}

export async function saveJobTemplate(jobTemplate) {
  return httpPost('job_template', jobTemplate);
}

export async function deleteJobTemplate(id) {
  return httpDelete(`job_template/${id}`);
}

export async function listJobTemplate() {
  return httpGet('job_template');
}
