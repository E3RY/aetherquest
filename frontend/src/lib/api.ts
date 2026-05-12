import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) {
    clear();
    return null;
  }
  try {
    const resp = await axios.post("/api/auth/refresh", { refresh_token: refreshToken });
    setTokens(resp.data.access_token, resp.data.refresh_token);
    return resp.data.access_token;
  } catch {
    clear();
    return null;
  }
}

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    if (error.response?.status === 401 && !original._retried && !original.url?.endsWith("/auth/login")) {
      original._retried = true;
      if (!refreshing) refreshing = tryRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      }
    }
    return Promise.reject(error);
  }
);
