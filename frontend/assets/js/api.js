/* api.js — thin wrapper around fetch() for the backend REST API */
const Api = (() => {
  const BASE = '/api';

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    let res;
    try {
      res = await fetch(BASE + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      throw new Error('Could not reach the server. Please check your connection and try again.');
    }

    let data = {};
    try { data = await res.json(); } catch (e) { /* empty body */ }

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }
    return data;
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    del: (path) => request('DELETE', path),
  };
})();
