import { apiRequest } from './client';

export function listUsers() {
  return apiRequest('/api/users/');
}

export function updateAdmin(userId, isAdmin) {
  return apiRequest(`/api/users/${userId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_admin: isAdmin }),
  });
}

export function deleteUser(userId) {
  return apiRequest(`/api/users/${userId}/`, { method: 'DELETE' });
}
