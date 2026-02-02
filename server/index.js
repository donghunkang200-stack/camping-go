// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import campingRoutes from "./routes/campingRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 0. MongoDB 연결 설정
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결 성공!"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// 1. 공통 미들웨어 설정
// CORS 설정: Netlify 배포 도메인 및 로컬 개발(Dev) 도메인 허용
// CORS 설정: 디버깅을 위해 모든 출처 허용 (보안상 나중에 특정 도메인으로 제한 필요)
const allowedOrigins = ["*"];

// if (process.env.NODE_ENV !== "production") {
//   // 개발 중 로컬 Vite 서버에서 테스트할 때 사용 (http://localhost:5173)
//   allowedOrigins.push("http://localhost:5173");
// }

const corsOptions = {
  origin: true, // true로 설정하면 요청한 Origin을 그대로 반사하여 허용함 (credentials: true와 함께 사용 시 필수)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // 쿠키/인증 헤더 허용
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Preflight 요청에 대한 명시적 처리 (일부 환경 호환성 위함)
app.options("*", cors(corsOptions));
app.use(express.json());

// 1.5. 서버 상태 확인용 (Health Check)
app.get("/", (req, res) => {
  res.send("Hello! Camping Server is running correctly. 🚀");
});

// 2. 통합 백엔드 라우터 연결
// - 인증 관련 (/api/register, /api/login)
app.use("/api", authRoutes);

// - 캠핑 데이터 관련 (/api/camping/all 등)
app.use("/api/camping", campingRoutes);

// 3. 서버 포트 실행
app.listen(PORT, () =>
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`),
);
