// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import campingRoutes from "./routes/campingRoutes.js";
import {
  loadCampingData,
  CACHE_DURATION,
} from "./controllers/campingController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 0. MongoDB 연결 설정
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결 성공!"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// CORS 설정: 환경별 허용 도메인 관리
const allowedOrigins = [
  process.env.CLIENT_URL || "https://camping-go.netlify.app",
  process.env.NODE_ENV === "development" ? "http://localhost:5173" : null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 브라우저가 아닌 요청(Postman 등) 또는 허용된 도메인인 경우 허용
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS 정책에 의해 차단되었습니다."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.send("Hello! Camping Server is running correctly. 🚀");
});

// API 라우트 연결
app.use("/api", authRoutes);
app.use("/api/camping", campingRoutes);

// 서버 실행
app.listen(PORT, () =>
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`),
);

// 캠핑 데이터 캐시 초기화 및 주기적 갱신
(async () => {
  try {
    await loadCampingData();
    console.log("✅ 캠핑 데이터 캐시 선로딩 완료");
  } catch (err) {
    console.error("❌ 캐시 선로딩 실패:", err);
  }

  const intervalMs = Number(process.env.CACHE_REFRESH_MS) || CACHE_DURATION;
  setInterval(async () => {
    try {
      await loadCampingData();
      console.log("🔄 캠핑 데이터 캐시 갱신 완료");
    } catch (err) {
      console.error("❌ 캐시 갱신 실패:", err);
    }
  }, intervalMs);
})();
