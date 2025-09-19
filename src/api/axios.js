// src/api/axios.js
import axios from "axios";
import useUserStore from "./userStore.js";

// --------------------------- 기본 설정 ---------------------------
const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// ------------------------- 리프레시 큐 제어 ------------------------
let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

// ------------------------- JWT 만료 판단 --------------------------
const base64UrlToBase64 = (str) => {
  const pad = (4 - (str.length % 4 || 4)) % 4;
  return str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
};

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(base64UrlToBase64(payload)));
  } catch {
    return null;
  }
};

export const willExpireSoon = (token, thresholdSec = 90) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now <= thresholdSec;
};

// ----------------------- 리프레시 실제 호출 -----------------------
const doRefresh = async () => {
  if (!refreshPromise) {
    const raw = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: 15000,
      headers: {}, // Authorization 제거
    });

    refreshPromise = raw
      .post("/auth/refresh", null)
      .then((res) => {
        const newAccess = res.data?.accessToken;
        if (!newAccess) throw new Error("서버에서 accessToken을 받지 못함");

        const store = useUserStore.getState();
        // setAccessToken 있으면 우선 사용, 없으면 setUser로 대체
        if (store.setAccessToken) store.setAccessToken(newAccess);
        else store.setUser({ ...(store.user || {}), accessToken: newAccess });

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        return newAccess;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// --------------------------- 요청 인터셉터 ------------------------
api.interceptors.request.use(
  async (config) => {
    const isRefresh = config.url?.includes("/auth/refresh");
    if (isRefresh) {
      if (config.headers?.Authorization) delete config.headers.Authorization;
      return config;
    }

    let token = useUserStore.getState().user?.accessToken;

    // 만료 임박 시 선제 리프레시 (실패해도 여기선 logout 안함)
    if (token && willExpireSoon(token, 90)) {
      try {
        token = await doRefresh();
      } catch {
        // 무시 → 기존 토큰으로 진행, 401이면 응답 인터셉터에서 처리
      }
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------- 응답 인터셉터 ------------------------
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (!original) return Promise.reject(error);

    const isTokenRefresh = original?.url?.includes("/auth/refresh");
    const isLogin = original?.url?.includes("/auth/login");

    // 리프레시 자체가 401 → 즉시 로그아웃
    if (status === 401 && isTokenRefresh) {
      useUserStore.getState().clearUser?.();
      return Promise.reject(error);
    }

    // 접근 토큰 만료로 추정되는 401 처리
    if (status === 401 && !original._retry && !isLogin) {
      if (isRefreshing) {
        // 다른 리프레시 진행 중 → 큐 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const newToken = await doRefresh();
        if (!newToken) throw new Error("Refresh 실패");

        processQueue(null, newToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // ❗리프레시까지 실패했을 때만 로그아웃
        useUserStore.getState().clearUser?.();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 앱 초기 로드 시 기본 헤더 세팅
(() => {
  const token = useUserStore.getState().user?.accessToken;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
})();

export default api;