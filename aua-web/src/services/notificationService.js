import { httpGet, httpDelete } from './http';

export async function getNotification(id) {
  return httpGet(`notification/${id}`);
}

export async function deleteNotification(id) {
  return httpDelete(`notification/${id}`);
}

export async function countUnreadNotification() {
  return httpGet(`notification/count/unread`);
}

export async function listNotification(page = 0) {
  return httpGet('notification', { page });
}


