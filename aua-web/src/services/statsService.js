import { httpGet, httpPost, request } from './http';

export async function getStats() {
  return httpGet(`stats`);
}

