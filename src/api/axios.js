// src/api/axios.js
import axios from "axios";
import useUserStore from "./userStore.js";

let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
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

const doRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh", null, { headers: { Authorization: undefined } })
      .then((res) => {
        const newAccess = res.data?.accessToken;
        if (!newAccess) throw new Error("서버에서 accessToken 안줌");

        const userStore = useUserStore.getState();
        const prevUser = userStore.user || {};
        const newUser = { ...prevUser, accessToken: newAccess };
        userStore.setUser(newUser);

        return newAccess;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(async (config) => {
  if (config.url?.includes("/auth/refresh")) {
    delete config.headers.Authorization;
    return config;
  }

  let token = useUserStore.getState().user?.accessToken;

  if (token && willExpireSoon(token)) {
    try {
      token = await doRefresh();
    } catch (e) {
      useUserStore.getState().clearUser();
      return Promise.reject(e);
    }
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isTokenRefresh = originalRequest?.url?.includes("/auth/refresh");
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    if (status === 401 && isTokenRefresh) {
      useUserStore.getState().clearUser();
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await doRefresh();
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useUserStore.getState().clearUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
