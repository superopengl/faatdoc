import { API_BASE_URL } from "services/http";

export function getFileUrl(fileId, throws = false) {
  if(throws && !fileId) {
    throw new Error('fileId is not specified');
  }
  return fileId ? `${API_BASE_URL}/file/download/${fileId}` : undefined
}