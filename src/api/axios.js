// src/api/axios.js
import axios from "axios";
import useUserStore from "./userStore.js";

// ------------------------------------------------------------------
// 환경변수 우선순위 통일
const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000/api";

// 공용 인스턴스
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// ------------------------------------------------------------------
// 동시 리프레시 제어
let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

// ------------------------------------------------------------------
// JWT 파싱 (base64url 안전)
const base64UrlToBase64 = (str) => {
  // add padding
  const pad = 4 - (str.length % 4 || 4);
  return str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
};

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const json = atob(base64UrlToBase64(payload));
    return JSON.parse(json);
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

// ------------------------------------------------------------------
// 안전한 리프레시 (raw axios 사용: 인터셉터/기본 Authorization 없음)
const doRefresh = async () => {
  if (!refreshPromise) {
    const raw = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: 15000,
      headers: {}, // 의도적으로 비움 (Authorization 미포함)
    });

    refreshPromise = raw
      .post("/auth/refresh", null) // 서버 명세에 맞게 필요 시 body 변경
      .then((res) => {
        const newAccess = res.data?.accessToken;
        if (!newAccess) throw new Error("서버에서 accessToken을 받지 못함");

        const userStore = useUserStore.getState();
        const prevUser = userStore.user || {};
        const newUser = { ...prevUser, accessToken: newAccess };
        userStore.setUser(newUser);

        // 기본 헤더에도 즉시 반영(이후 요청에 사용)
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        return newAccess;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// ------------------------------------------------------------------
// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    const isRefresh = config.url?.includes("/auth/refresh");
    if (isRefresh) {
      // 혹시 모를 잔여 헤더 제거 (방어적)
      if (config.headers?.Authorization) delete config.headers.Authorization;
      return config;
    }

    let token = useUserStore.getState().user?.accessToken;

    // 만료 임박 시 선제 리프레시 시도하되, 실패해도 "로그아웃하지 않음"
    if (token && willExpireSoon(token, 90)) {
      try {
        token = await doRefresh();
      } catch (e) {
        // ❗여기서 clearUser() 하지 않음 — 기존 토큰으로 그냥 진행
        // 네트워크 순간 장애/간헐 오류로 인한 '스토어 밀림' 예방
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

// ------------------------------------------------------------------
// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // 구성 없는 에러(네트워크 등)는 그대로
    if (!originalRequest) return Promise.reject(error);

    const isTokenRefresh = originalRequest?.url?.includes("/auth/refresh");
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    // 리프레시 자체가 401이면 즉시 로그아웃
    if (status === 401 && isTokenRefresh) {
      useUserStore.getState().clearUser?.();
      return Promise.reject(error);
    }

    // 접근 토큰 만료로 추정되는 401 처리(로그인/리프레시 제외)
    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      // 동시 401 → 큐 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // 리프레시 시작
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await doRefresh();
        if (!newAccessToken) throw new Error("Refresh 실패");

        processQueue(null, newAccessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // ❗여기서만 로그아웃 — 진짜로 리프레시까지 실패했을 때
        useUserStore.getState().clearUser?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 필요한 경우 403/419 등 정책 분기를 여기서 추가 가능
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------------
// 앱 최초 로드 시 스토어에 토큰이 있으면 기본 헤더 세팅
(() => {
  const token = useUserStore.getState().user?.accessToken;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
})();

export default api;
