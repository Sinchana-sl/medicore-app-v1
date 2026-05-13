import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let _refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${BASE}/auth/refresh`,
    { refreshToken }
  );
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('loginTime', String(Date.now()));
  return data.accessToken;
}

// On 401: try silent token refresh once, then retry; on failure log out.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url: string = error.config?.url ?? '';
    const isAuthRoute = url.startsWith('/auth/');

    if (!isAuthRoute && error.response?.status === 401) {
      try {
        // Deduplicate concurrent refresh calls
        if (!_refreshing) {
          _refreshing = refreshAccessToken().finally(() => { _refreshing = null; });
        }
        const newToken = await _refreshing;
        error.config.headers = { ...error.config.headers, Authorization: `Bearer ${newToken}` };
        return api(error.config);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    if (!isAuthRoute && error.response?.status === 403) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
