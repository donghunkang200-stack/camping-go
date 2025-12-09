import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = "https://apis.data.go.kr/B551011/GoCamping";

let cache = []; // 전체 데이터 캐싱
let lastFetchTime = 0; // 캐시 유효시간 체크
const CACHE_DURATION = 1000 * 60 * 30; // 30분

/* ---------------------------------------------------
    공통: 전체 목록 로드 함수 (캐싱)
---------------------------------------------------- */
async function loadCampingData() {
  const now = Date.now();

  // 30분 이내 캐시 있으면 재사용
  if (cache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cache;
  }

  try {
    const response = await axios.get(`${BASE_URL}/basedList`, {
      params: {
        serviceKey: process.env.GOCAMPING_KEY,
        MobileOS: "ETC",
        MobileApp: "CampApp",
        numOfRows: 9999,
        pageNo: 1,
        _type: "json",
      },
    });

    cache = response.data.response?.body?.items?.item || [];
    lastFetchTime = now;

    return cache;
  } catch (err) {
    console.error("❌ 전체 데이터 로드 실패:", err);
    return [];
  }
}

/* ---------------------------------------------------
    1) 전체 캠핑장 목록 (basedList)
---------------------------------------------------- */

app.get("/api/camping/all", async (req, res) => {
  const data = await loadCampingData();
  res.json(data);
});

/* ---------------------------------------------------
    2) 키워드 검색 (searchList)
---------------------------------------------------- */
app.get("/api/camping/search", async (req, res) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword || keyword.trim() === "") {
      return res.json({ data: [] });
    }

    const response = await axios.get(`${BASE_URL}/searchList`, {
      params: {
        serviceKey: process.env.GOCAMPING_KEY,
        MobileOS: "ETC",
        MobileApp: "CampApp",
        keyword,
        numOfRows: 500,
        pageNo: 1,
        _type: "json",
      },
    });

    const result = response.data.response;
    const items = result?.body?.items?.item || [];

    res.json({ data: items });
  } catch (err) {
    console.error("SEARCH API ERROR:", err);
    res.status(500).json({ error: "검색 API 실패" });
  }
});

/* ---------------------------------------------------
    3) 상세 조회
---------------------------------------------------- */
app.get("/api/camping/detail/:id", async (req, res) => {
  const id = req.params.id;

  const all = await loadCampingData();
  const detail = all.find((camp) => String(camp.contentId) === id);

  res.json({ data: detail || null });
});

/* ---------------------------------------------------
    4) 좌표 기반 주변 캠핑장 조회
---------------------------------------------------- */
app.get("/api/camping/nearby", async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "위도(lat), 경도(lng)가 필요합니다." });
    }

    const targetLat = Number(lat);
    const targetLng = Number(lng);
    const maxDistance = distance ? Number(distance) : 10;

    const all = await loadCampingData();

    // 거리 계산 함수
    const calcDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const filtered = all.filter((camp) => {
      if (!camp.mapY || !camp.mapX) return false;

      const d = calcDistance(targetLat, targetLng, camp.mapY, camp.mapX);
      return d <= maxDistance;
    });

    filtered.sort((a, b) => {
      const da = calcDistance(targetLat, targetLng, a.mapY, a.mapX);
      const db = calcDistance(targetLat, targetLng, b.mapY, b.mapX);
      return da - db;
    });

    res.json({ data: filtered.slice(0, 5) });
  } catch (error) {
    console.error("NEARBY API ERROR:", error);
    res.status(500).json({ error: "주변 캠핑장 조회 실패" });
  }
});

/* ---------------------------------------------------
    서버 시작
---------------------------------------------------- */
app.listen(5000, () => console.log("Server running on port 5000"));
