import { httpGet, httpDelete, httpPost } from './http';

export async function getNotification(id) {
  return httpGet(`notification/${id}`);
}

export async function deleteNotification(id) {
  return httpDelete(`notification/${id}`);
}

export async function countUnreadNotification() {
  return httpGet(`notification/count/unread`);
}

/**
 * 
 * @param {page: number, size: number, unreadOnly: boolean} query
 */
export async function listNotification(query) {
  return httpPost('notification', query);
}


