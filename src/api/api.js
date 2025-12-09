// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // 프록시 또는 배포 서버에 맞게 조정
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response.data, // 항상 response.data 반환
  (error) => {
    console.error("API ERROR:", error);
    return Promise.reject(error);
  }
);

export default api;
