// src/api/api.js
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// API Base URL 설정
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE || "";
  url = url.replace(/\/$/, "");
  if (url.endsWith("/api")) {
    return url;
  }
  return url ? `${url}/api` : "/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터: 데이터 추출 및 에러 처리
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "요청 중 오류가 발생했습니다.";
    return Promise.reject(new Error(message));
  },
);

// 인증 API 서비스
export const apiService = {
  // 로그인
  login: async (username, password) => {
    return api.post("/login", { username, password });
  },
  // 회원가입
  register: async (usernameOrData, password) => {
    if (typeof usernameOrData === "object" && usernameOrData !== null) {
      return api.post("/register", usernameOrData);
    }
    return api.post("/register", { username: usernameOrData, password });
  },
};

export default api;
