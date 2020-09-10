import { httpGet, httpPost, httpDelete } from './http';
import { reactLocalStorage } from 'reactjs-localstorage';

export async function getNotification(id) {
  return httpGet(`notification/${id}`);
}

export async function deleteNotification(id) {
  return httpDelete(`notification/${id}`);
}

export async function refreshNotificationUnreadCount() {
  const count = await httpGet(`notification/count/unread`);
  return count;
}

export async function listNotification() {
  return httpGet('notification');
}

