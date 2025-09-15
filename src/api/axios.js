import axios from "axios";
import useUserStore from "./userStore.js";

/* =========================================================
   😉 형석이를 위한 친절한 설명글
   Axios 기본 세팅 + 토큰 자동 갱신 로직
   👉 모든 API 요청은 여기서 만든 api 객체를 통해서만 보내면 됨
   👉 accessToken 만료되면 알아서 /auth/refresh 호출해서 갱신해줌
   👉 refresh 실패하면 강제로 로그아웃 처리
========================================================= */

let isRefreshing = false; // 지금 refresh 중인지 체크
let failedQueue = [];     // refresh 끝날 때까지 기다리는 요청들 쌓아두는 곳

// refresh 끝나면, 기다리던 요청들 처리해주는 함수
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error); 
    else prom.resolve(token);      
  });
  failedQueue = [];
};

// 토큰 안(exp 값) 확인하려고 쓰는 거
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

// 토큰이 곧 만료될 건지 체크 (기본 90초 남았으면 true)
export const willExpireSoon = (token, thresholdSec = 90) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now <= thresholdSec;
};

let refreshPromise = null; // 동시에 여러번 refresh 안 나가게 막는 용도

// 실제 refresh 요청 보내는 함수
const doRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh", null, { headers: { Authorization: undefined } })
      .then((res) => {
        const newAccess = res.data?.accessToken;
        if (!newAccess) throw new Error("서버에서 accessToken 안줌");

        // zustand 상태 + localStorage 둘 다 갱신
        const userStore = useUserStore.getState();
        const prevUser = userStore.user || {};
        const newUser = { ...prevUser, accessToken: newAccess };
        userStore.setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));

        return newAccess;
      })
      .finally(() => {
        refreshPromise = null; // 끝나면 초기화
      });
  }
  return refreshPromise;
};

// axios 인스턴스 생성 (이걸 api라고 부름)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
  withCredentials: true, // 쿠키 같이 보냄 (refreshToken 때문)
});

// ---------------- 요청 인터셉터 ----------------
// 요청 나가기 전에 토큰 껴주고,
// 만료 임박이면 미리 refresh 해서 토큰 교체
api.interceptors.request.use(
  async (config) => {
    const isRefresh = config.url?.includes("/auth/refresh");
    if (isRefresh) {
      // refresh 자체 요청에는 Authorization 빼고 보냄
      if (config.headers?.Authorization) delete config.headers.Authorization;
      return config;
    }

    // 저장된 토큰 불러오기 (zustand → localStorage 순서)
    let token =
      useUserStore.getState().user?.accessToken ||
      JSON.parse(localStorage.getItem("user") || "{}")?.accessToken;

    // 곧 만료될 토큰이면 refresh 실행
    if (token && willExpireSoon(token, 90)) {
      try {
        token = await doRefresh();
      } catch (e) {
        // refresh 실패 → 세션 초기화
        useUserStore.getState().clearUser();
        localStorage.removeItem("user");
        return Promise.reject(e);
      }
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- 응답 인터셉터 ----------------
// 응답이 401(토큰 만료) 나오면 → refresh 시도
// refresh 성공 → 요청 다시 보냄
// refresh 실패 → 세션 초기화
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isTokenRefresh = originalRequest?.url?.includes("/auth/refresh");
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    if (status === 401 && isTokenRefresh) {
      // refresh 자체가 실패했으면 그냥 로그아웃
      useUserStore.getState().clearUser();
      localStorage.removeItem("user");
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      if (isRefreshing) {
        // 이미 다른 요청이 refresh 중이면 여기서 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest); // 새 토큰으로 다시 시도
          })
          .catch((err) => Promise.reject(err));
      }

      // 내가 refresh 담당이 됨
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await doRefresh();
        if (!newAccessToken) throw new Error("Refresh 실패");

        // 대기열 처리 + 원래 요청 재시도
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh 실패 → 대기열 전부 실패 처리 후 로그아웃
        processQueue(refreshError, null);
        useUserStore.getState().clearUser();
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
