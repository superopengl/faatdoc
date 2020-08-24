import { baseURL } from "services/http";

export function getFileUrl(fileId, throws = false) {
  if(throws && !fileId) {
    throw new Error('fileId is not specified');
  }
  return fileId ? `${baseURL}/file/download/${fileId}` : undefined
}