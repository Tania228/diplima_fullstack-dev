import { apiRequest } from './client';

export function listFiles(userId) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiRequest(`/api/files/${query}`);
}

export function uploadFile({ file, comment, userId }) {
  const body = new FormData();
  body.append('file', file);
  body.append('comment', comment || '');
  if (userId) {
    body.append('user_id', String(userId));
  }
  return apiRequest('/api/files/upload/', { method: 'POST', body });
}

export function renameFile(fileId, name) {
  return apiRequest(`/api/files/${fileId}/rename/`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export function updateComment(fileId, comment) {
  return apiRequest(`/api/files/${fileId}/comment/`, {
    method: 'PATCH',
    body: JSON.stringify({ comment }),
  });
}

export function deleteFile(fileId) {
  return apiRequest(`/api/files/${fileId}/`, { method: 'DELETE' });
}

export function getLink(fileId) {
  return apiRequest(`/api/files/${fileId}/link/`);
}
