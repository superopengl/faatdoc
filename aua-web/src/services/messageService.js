import { httpGet, httpDelete, httpPost } from './http';

export async function getMessage(id) {
  return httpGet(`message/${id}`);
}

export async function deleteMessage(id) {
  return httpDelete(`message/${id}`);
}

export async function countUnreadMessage() {
  return httpGet(`message/count/unread`);
}

export async function listMessages(query) {
  return httpPost('message', query);
}


