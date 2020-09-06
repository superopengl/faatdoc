import { httpGet, httpPost, httpDelete } from './http';
import { reactLocalStorage } from 'reactjs-localstorage';

export async function getNotification(id) {
  return httpGet(`notification/${id}`);
}

export async function refreshNotificationUnreadCount() {
  const count = await httpGet(`notification/count/unread`);
  setNotificationCount(count);
  return count;
}

export async function listNotification() {
  return httpGet('notification');
}

export function setNotificationCount(count) {
  reactLocalStorage.set('notificationCount', count);
}

export function getNotificationCount() {
  return reactLocalStorage.get('notificationCount');
}