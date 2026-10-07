function getCookie(name) {
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    const index = part.indexOf('=');
    const key = index === -1 ? part : part.slice(0, index);
    if (key === name) {
      return decodeURIComponent(index === -1 ? '' : part.slice(index + 1));
    }
  }
  return '';
}

export async function apiRequest(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const method = (options.method || 'GET').toUpperCase();
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isForm && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('X-CSRFToken', getCookie('csrftoken'));
  }
  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'same-origin',
  });
  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  }
  return { ok: response.ok, status: response.status, data };
}
